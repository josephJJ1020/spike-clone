require("dotenv").config();
var nodemailer = require("nodemailer");

const sendEmail = ({
  fromEmail,
  password,
  service,
  host = null,
  port = null,
  toEmails,
  subject = null,
  text,
  files = []
}) => {
  let transporterConfig;

  if (service === "HOTMAIL") {
    console.log('hotmail mailing service')
    transporterConfig = {
      service: service,
      auth: {
        user: fromEmail,
        pass: password,
      },
    };
  } else {
    console.log('not hotmail mailing service')
    transporterConfig = {
      host: host,
      port: port,
      auth: {
        user: fromEmail,
        pass: password,
      },
    };
  }

  var transporter = nodemailer.createTransport(transporterConfig);

  var mailOptions = {
    from: fromEmail,
    to: [...toEmails],
    subject: subject,
    text: text,
    attachments: !files.length ? null : [...files.map(file => {
      return {filename: file.filename, path: `../server/files/${file.filename}`}
    })]
  };

  transporter.sendMail(mailOptions, function (error, info) {
    if (error) {
      console.log(error);
    } else {
      console.log("Email sent: " + info.response);
    }
  });
};

module.exports = sendEmail;
