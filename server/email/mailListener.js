const notifier = require("mail-notifier");
const fs = require("fs");

const msgController = require("../controllers/msgController");
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
    console.log(this.#getInboundHost());
    return (this.listener = notifier);
  }

  start() {
    if (this.#imapConfig) {
      this.listener(this.#imapConfig)
        .on("connected", () => {
          console.log(`${this.email}'s email listener connected`);
        })
        .on("mail", async (mail) => {
          console.log(`mail date: ${mail.headers.date}`);

          // format text to not include thread replies
          const content = mail.text
          .split("________________________________")[0]
          .replace(/(\r\n|\n|\r)/gm, "")

          // upload files from mail.attachments first before adding the message
          let filesList = [];

          // console.log(mail.attachments);
          console.log(mail.uid);

          // console.log(mail.headers.to.split(",")); // returns array with string of emails

          console.log(mail.from); // can use this instead

          /*
          
          [
            {
              address: 'the.josephfernando@outlook.com',
              name: 'Earl Joseph Fernando'
            }
          ]
          */
          console.log(`mail.headers.to:`);
          console.log(mail.headers.to);
          const emailTo = mail.headers.to.split(",");
          const emailToFinal = emailTo.length < 2 ? [mail.headers.to] : emailTo;

          const participants = [
            ...mail.from.map((user) => {
              return { email: user.address };
            }),
            ...emailToFinal.map((email) => {
              /* 
              
              error here, because it keeps changing from 
              
              mail.headers.to:
              "joseph.joseph10@outlook.com" <joseph.joseph10@outlook.com>, 
              "the.josephfernando@gmail.com" <the.josephfernando@gmail.com>

              to 

              mail.headers.to:
              joseph.joseph10@outlook.com, 
              joseph_fernando_joseph@yahoo.com

              so in the second scenario, it will say that there is an error
              on email.split() since each item is the email already and
              a string like '"the.josephfernando@gmail.com" <the.josephfernando@gmail.com>'
              
              */

              // try solution
              let participantEmail = email.split(" ");

              if (participantEmail.length > 1) {
                return { email: participantEmail[1].replace(/[<>]/g, "") };
              } else {
                return { email: email };
              }
            }),
          ];

          console.log(participants);

          if (mail.attachments) {
            mail.attachments.forEach(async (file) => {
              try {
                if (!fs.existsSync(`../server/files/${file.fileName}`)) {
                  fs.writeFileSync(
                    `../server/files/${file.fileName}`,
                    file.content
                  );

                  console.log(`uploaded ${file.fileName}`);
                  console.log(filesList);
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

          const convo =
            await this.messageController.getConversationByParticipants(
              participants
            ); // this is working

          let newConvo;

          // if convo doesn't exist, make new one
          if (!convo) {
            console.log("convo not found");
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
              mail.messageId
            );
          }

          // check if message exists in convo (use id or mail.messagId?)
          // if it doesn't then add message
          else if (
            !convo.messages.find(
              (message) =>
                message.id === mail.messageId || message.content === content
            )
          ) {
            console.log("convo found");
            newConvo = await this.messageController.addMessage(
              {
                email: participants[0].email,
              },
              {
                content: content,
              },
              convo._id,
              filesList,
              mail.messageId
            );
          }

          // lastly, emit new-message event to all online users
          this.onlineUsers.forEach((user) => {
            if (
              newConvo.participants.some(
                (participant) => participant.email === user.email
              )
            ) {
              console.log("sending new-message event to online user");
              this.socket.to(user.socketId).emit("new-message", newConvo);
            }
          });

          // listener works, just need to format text and emit new-message event to user

          // NOTE: need to format text because it doesn't return the message only
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
