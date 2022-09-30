const Imap = require("imap");

const { simpleParser } = require("mailparser");

require("dotenv").config();

const fetchEmailFromTo = (email, password, inboundHost, inboundPort, fromDate, toDate) => {
  const imapConfig = {
    user: process.env.EMAIL,
    password: process.env.PASSWORD,
    host: "imap.gmail.com",
    port: 993,
    tls: true,
  };

  const getEmails = () => {
    try {
      const imap = new Imap(imapConfig);
      imap.once("ready", () => {
        imap.openBox("INBOX", false, () => {
          imap.search([["SINCE", fromDate], ["BEFORE", toDate]], (err, results) => {
            const f = imap.fetch(results, { bodies: "" });
            f.on("message", (msg) => {
              msg.on("body", (stream) => {
                simpleParser(stream, async (err, parsed) => {
                  //   const {from, subject, textAsHtml, text} = parsed;
                  const { headers, from, to, text } = parsed;
                  console.log(headers.get('message-id'))
                  console.log(from);
                  console.log(to);
                  console.log(text);
                  /* Make API call to save the data
                       Save the retrieved data into a database.
                       E.t.c
                    */
                });
              });
              msg.once("attributes", (attrs) => {
                const { uid } = attrs;
                imap.addFlags(uid, ["\\Seen"], () => {
                  // Mark the email as read after reading it
                  console.log("Marked as read!");
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
          });
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


module.exports = fetchEmailFromTo