const Imap = require("imap");
const msgController = require("../controllers/msgController");
const { controller: userController } = require("../controllers/controller");
const fs = require("fs");

const { simpleParser } = require("mailparser");

require("dotenv").config();

const fetchEmailFromTo = async (
  email,
  password,
  inboundHost,
  inboundPort,
  fromDate,
  toDate,
  socket,
  onlineUsers,
  mailbox
) => {
  const imapConfig = {
    user: email,
    password: password,
    host: inboundHost,
    port: inboundPort,
    tls: true,
  };

  const getEmails = () => {
    try {
      const imap = new Imap(imapConfig);
      imap.once("ready", () => {
        imap.openBox(mailbox, false, () => {
          imap.search(
            [
              // ["SINCE", fromDate],
              // ["SENTBEFORE", toDate],
              ["ALL"],
            ],
            (err, results) => {
              const f = imap.fetch(results, { bodies: "" });
              f.on("message", (msg) => {
                msg.on("body", (stream) => {
                  simpleParser(stream, async (err, parsed) => {
                    if (err) console.log(err.message);
                    //   const {from, subject, textAsHtml, text} = parsed;
                    // console.log(parsed)
                    const { headers, from, to, text, attachments } = parsed;

                    // format text to not include thread replies
                    const content = text
                      ? text
                          .split("________________________________")[0]
                          .replace(/(\r\n|\n|\r)/gm, "")
                      : "";

                    // upload files from mail.attachments first before adding the message
                    let filesList = [];
                    const headersTo = [...to.value];

                    const participants = [
                      ...from.value.map((user) => {
                        return { email: user.address };
                      }),
                      ...headersTo.map((user) => {
                        return { email: user.address };
                      }),
                    ];

                    if (attachments) {
                      attachments.forEach((file) => {
                        try {
                          if (
                            !fs.existsSync(`../server/files/${file.filename}`)
                          ) {
                            fs.writeFileSync(
                              `../server/files/${file.filename}`,
                              file.content
                            );
                          }

                          filesList.push({
                            filename: file.filename,
                            fileLink: `http://localhost:3001/${file.filename}`,
                          });
                        } catch (err) {
                          console.log(err);
                        }
                      });
                    }
                    let newConvo;

                    const convo =
                      await msgController.getConversationByParticipants(
                        participants
                      ); // this is working

                    // if convo doesn't exist, make new one
                    if (!convo) {
                      newConvo = await msgController.addMessage(
                        {
                          email: participants[0].email,
                        },
                        {
                          content: content,
                          to: participants.slice(1),
                        },
                        null,
                        filesList,
                        headers.get("message-id"),
                        Date.parse(headers.get("date"))
                      );
                    }

                    // check if message exists in convo (use id or mail.messagId?)
                    // if it doesn't then add message
                    else if (
                      convo.messages.find(
                        (message) =>
                          message.id === headers.get("message-id") ||
                          message.content === content
                      )
                    ) {
                      console.log("message already exists");
                    } else {
                      newConvo = await msgController.addMessage(
                        {
                          email: participants[0].email,
                        },
                        {
                          content: content,
                        },
                        convo._id,
                        filesList,
                        headers.get("message-id"),
                        Date.parse(headers.get("date"))
                      );

                      console.log(`newConvo id: ${newConvo._id}`);

                      // lastly, emit new-message event to all online users

                      onlineUsers.forEach((user) => {
                        if (
                          newConvo.participants.some(
                            (participant) => participant.email === user.email
                          )
                        ) {
                          socket
                            .to(user.socketId)
                            .emit("new-message", newConvo);
                        }
                      });
                    }

                    await userController.setUserLastFetched(
                      email,
                      Date.parse(headers.get("date"))
                    );
                  });
                });
              });
              f.once("error", (ex) => {
                return Promise.reject(ex);
              });
              f.once("end", () => {
                console.log("Done fetching all messages!");
                imap.end();
              });
            }
          );
        });
      });

      imap.once("error", (err) => {
        console.log(err);
      });

      imap.once("end", () => {
        console.log("Connection ended");
      });

      imap.connect();
    } catch (ex) {
      console.log("an error occurred");
    }
  };

  getEmails();
};

module.exports = fetchEmailFromTo;