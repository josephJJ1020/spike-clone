const Imap = require("imap");
const fs = require("fs");

const msgController = require("../controllers/msgController");
const { controller: userController } = require("../controllers/controller");
const formatText = require("./formatText");

const { simpleParser } = require("mailparser");

require("dotenv").config();

const getEmails = async (email, imapConfig, mailbox) => {
  try {
    let returnValue;

    let minLastFetched = Date.now();

    const imap = new Imap(imapConfig);

    imap.once("ready", async () => {
      console.log("ready to fetch emails");

      // fetch conversations' identifiers (conversation Ids) from db
      let conversationIdsFromDb =
        await msgController.getConversationsByIdentifier();

      conversationIdsFromDb = conversationIdsFromDb.map(
        (convo) => convo.identifier
      );

      imap.openBox(mailbox, false, () => {
        imap.search([["ALL"]], (err, results) => {
          const f = imap.fetch(results, { bodies: "" });

          let msgArray = []; // array of messages

          f.on("message", (msg) => {
            msg.on("body", (stream) => {
              console.log("-");
              simpleParser(stream, async (err, parsed) => {
                if (err) console.log(err.message);
                const { headers, from, to, text, attachments } = parsed;

                // format text to not include thread replies
                const content = formatText(text);

                // upload files from mail.attachments first before adding the message
                let filesList = [];
                const headersTo = [...to.value];

                let fromValue = from.value.map((user) => {
                  return { email: user.address };
                });

                let toValue = headersTo.map((user) => {
                  return { email: user.address };
                });

                let participants = [...fromValue, ...toValue];

                // remove duplicates
                participants = participants.reduce((unique, o) => {
                  if (
                    !unique.some(
                      (obj) => obj.email === o.email && obj.value === o.value
                    )
                  ) {
                    unique.push(o);
                  }
                  return unique;
                }, []);

                // sort
                participants = participants.sort((a, b) =>
                  a.email.localeCompare(b.email)
                );

                // if there are attachments, upload them to server
                if (attachments) {
                  attachments.forEach((file) => {
                    try {
                      if (!fs.existsSync(`../server/files/${file.filename}`)) {
                        fs.writeFileSync(
                          `../server/files/${file.filename}`,
                          file.content
                        );
                      }

                      // add filename and file link to filesList array (to store later in database inside the message object)
                      filesList.push({
                        filename: file.filename,
                        fileLink: `https://earl-server.zapto.org/api/${file.filename}`,
                      });
                    } catch (err) {
                      console.log(err);
                    }
                  });
                }

                // init message object
                let message = {
                  from: fromValue[0],
                  to: toValue,
                  content: content,
                  files: filesList,
                  messageId: headers.get("message-id"),
                  dateCreated: Date.parse(headers.get("date")),
                  read: [],
                };

                // push message object to message array
                msgArray.push({ participants, message });

                await userController.setUserLastFetched(
                  email,
                  Math.min(Date.parse(headers.get("date"), minLastFetched))
                );
              });
            });
          });
          f.once("error", (ex) => {
            return Promise.reject(ex);
          });
          f.once("end", async () => {
            // note: don't use identifier, just use participants

            // init user conversations/email threads
            let actualData = {};

            // init array of messages to append to existing conversation/email thread
            let messagesToBePushedOnly = [];

            /*
              // fetch conversations' identifiers (conversation Ids) from db
              let conversationIdsFromDb =
                await msgController.getConversationsByIdentifier();

              conversationIdsFromDb = conversationIdsFromDb.map(
                (convo) => convo.identifier
              );

              */

            // loop through each message object in message array
            for (const data of msgArray) {
              const identifier = data.participants
                .map((user) => user.email)
                .join(",");

              // if conversation already exists in db, just add message to conversation
              if (conversationIdsFromDb.includes(identifier)) {
                messagesToBePushedOnly.push({
                  identifier,
                  message: data.message,
                });

                // if conversation doesn't exist in db, run code below
              } else {
                // if convo exists already from fetch, just push the message into convo
                if (actualData[identifier]) {
                  actualData[identifier].messages.push(data.message);
                } else {
                  // if not, create new conversation
                  actualData[identifier] = {
                    identifier,
                    participants: data.participants,
                    messages: [data.message],
                  };
                }
              }
            }

            for (const key in actualData) {
              const data = actualData[key];
              // store conversation in database

              await msgController.makeConversationWithMessages(
                data.identifier,
                data.participants,
                data.messages
              );
            }

            for (const message of messagesToBePushedOnly) {
              // add new message to existing conversation
              await msgController.AddMessageToConversation(
                message.identifier,
                message.message
              );
            }

            console.log(
              `total conversations: ${Object.keys(actualData).length}`
            );

            imap.end();
          });
        });
      });
    });

    imap.once("error", (err) => {
      console.log("email fetcher errored");
      console.log(err);
    });

    imap.connect();

    // returns after fetching emails
    return new Promise((res, rej) => {
      imap.once("end", async () => {
        console.log("fetching ended");
        res(true);
      });
    });
  } catch (ex) {
    console.log("an error occurred when fetching emails", ex.message);
  }
};

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

  const res = await getEmails(email, imapConfig, mailbox);
  if (res) return res;
};

module.exports = fetchEmailFromTo;
