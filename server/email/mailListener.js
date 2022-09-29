const notifier = require("mail-notifier");
const fs = require("fs");

const msgController = require('../controllers/msgController')
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
    console.log(this.#getInboundHost())
    return (this.listener = notifier);
  }

  start() {
    if (this.#imapConfig) {
      this.listener(this.#imapConfig)
        .on("mail", async (mail) => {
          // upload files from mail.attachments first before adding the message
          let filesList = [];

          console.log(mail.attachments);

          // files.forEach(async (file) => {
          //   try {
          //     if (!fs.existsSync(`${__dirname}/files/${file.filename}`)) {
          //       fs.writeFileSync(`${__dirname}/files/${file.filename}`, file.file);

          //       console.log(`uploaded ${file.filename}`);
          //       console.log(filesList);
          //     }

          //     filesList.push({
          //       filename: file.filename,
          //       fileLink: `http://localhost:3001/${file.filename}`,
          //     });
          //   } catch (err) {
          //     console.log(err);
          //   }
          // });

          // await this.messageController.addMessage({
          //   email: this.email,
          // }, {
          //   content: mail.text
          // }, this.messageController.getConversationIdByParticipants([mail.headers.from, ...mail.headers.to]),

          // )
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
