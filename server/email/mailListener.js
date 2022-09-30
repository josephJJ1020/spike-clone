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
          const participants = [
            ...mail.from.map((user) => {
              return { email: user.address };
            }),
            ...mail.headers.to.split(",").map((email) => {
              return { email: email.split(" ")[1].replace(/[<>]/g, "") };
            }),
          ];

          console.log(participants);

          const convo =
            await this.messageController.getConversationByParticipants(
              participants
            ); // this is working

          if (convo) {
            if (mail.attachments) {
              mail.attachments.forEach(async (file) => {
                try {
                  if (!fs.existsSync(`${__dirname}/files/${file.fileName}`)) {
                    fs.writeFileSync(
                      `${__dirname}/files/${file.fileName}`,
                      file.file
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

            // check if message exists in convo (use id or mail.messagId?)
            // if it doesn't then add message
          }
          let newConvo;
          if (
            !convo.messages.find(
              (message) =>
                message.id === mail.messageId || message.content === mail.text
            )
          ) {
            newConvo = await this.messageController.addMessage(
              {
                email: this.email,
              },
              {
                content: mail.text,
              },
              convo._id,
              filesList
            );
          }

          // lastly, emit new-message event to all online users
          this.onlineUsers.forEach((user) => {
            if (
              convo.participants.some(
                (participant) => participant.email === user.email
              )
            ) {
              this.socket
                .to(user.socketId)
                .emit("new-message", newConvo);
            }
          });

          // NOTE: need to format text because it doesn't return the message only
          mail.text.trim()
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
