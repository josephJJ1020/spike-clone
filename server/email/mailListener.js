const notifier = require("mail-notifier");
const fs = require("fs");

const msgController = require("../controllers/msgController");
const formatText = require("./formatText");
class EmailListener {
  #password;
  #inboundHost;
  #inboundPort;
  #imapConfig;

  constructor(email, password, inboundHost, inboundPort, socket, onlineUsers) {
    this.email = email;
    this.#password = password;
    this.#inboundHost = inboundHost;
    this.#inboundPort = inboundPort;
    this.listener = null;
    this.#imapConfig = {};
    this.socket = socket;
    this.messageController = msgController;
    this.onlineUsers = onlineUsers;
  }
  #getInboundHost() {
    return this.#inboundHost;
  }
  #getInboundPort() {
    return this.#inboundPort;
  }
  #getPassword() {
    return this.#password;
  }

  #initImapConfig() {
    return {
      user: this.email,
      password: this.#getPassword(),
      host: this.#getInboundHost(),
      port: this.#getInboundPort(),
      tls: true,
      tlsOptions: {
        rejectUnauthorized: false,
      },
      box: "INBOX",
    };
  }

  #setImapConfig(config) {
    return (this.#imapConfig = config);
  }

  init() {
    this.#imapConfig = this.#setImapConfig(this.#initImapConfig());
    return (this.listener = notifier);
  }

  async start() {
    if (this.#imapConfig) {
      this.listener(this.#imapConfig)
        .on("connected", () => {
          console.log(`${this.email}'s email listener connected`);
        })
        .on("mail", async (mail) => {
          // format text to not include thread replies
          const content = formatText(mail.text);

          // upload files from mail.attachments first before adding the message
          let filesList = [];

          const emailTo = mail.headers.to.split(",");
          const emailToFinal = emailTo.length < 2 ? [mail.headers.to] : emailTo;

          const participants = [
            ...mail.from.map((user) => {
              return { email: user.address };
            }),
            ...emailToFinal.map((email) => {
              let participantEmail = email.split(" ");

              if (participantEmail.length > 1) {
                return { email: participantEmail[1].replace(/[<>]/g, "") };
              } else {
                return { email: email };
              }
            }),
          ];

          if (mail.attachments) {
            mail.attachments.forEach(async (file) => {
              try {
                if (!fs.existsSync(`../server/files/${file.fileName}`)) {
                  fs.writeFileSync(
                    `../server/files/${file.fileName}`,
                    file.content
                  );
                }

                filesList.push({
                  filename: file.fileName,
                  fileLink: `http://localhost:3001/${file.fileName}`,
                });
              } catch (err) {
                console.log(err);
              }
            });
          }
          let newConvo;

          const convo =
            await this.messageController.getConversationByParticipants(
              participants
            ); // this is working

          // if convo doesn't exist, make new one
          if (!convo) {
            newConvo = await this.messageController.addMessage(
              {
                email: participants[0].email,
              },
              {
                content: content,
                to: participants.slice(1),
              },
              null,
              filesList,
              mail.messageId,
              Date.parse(mail.headers.date)
            );
          }

          // check if message exists in convo (use id or mail.messagId?)
          // if it doesn't then add message
          else if (
            convo.messages.find(
              (message) =>
                message.id === mail.messageId || message.content === content
            )
          ) {
            console.log("message already exists");
            return;
          } else {
            newConvo = await this.messageController.addMessage(
              {
                email: participants[0].email,
              },
              {
                content: content,
              },
              convo._id,
              filesList,
              mail.messageId,
              Date.parse(mail.headers.date)
            );

            // lastly, emit new-message event to all online users
          }
          this.onlineUsers.forEach((user) => {
            if (
              newConvo.participants.some(
                (participant) => participant.email === user.email
              )
            ) {
              this.socket.to(user.socketId).emit("new-message", newConvo);
            }
          });
        })
        .on("error", (err) => {
          console.log(err.message);
        })
        .on("end", () => {
          console.log(`${this.email}'s email listener disconnected`);
        })
        .start();
    }
  }

  setOnlineUsers(onlineUsers) {
    this.onlineUsers = onlineUsers;
  }

  close() {
    this.listener.stop();
  }
}

module.exports = EmailListener;
