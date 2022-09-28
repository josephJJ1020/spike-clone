require("dotenv").config();
var nodemailer = require("nodemailer");

const sendEmail = (
  fromEmail,
  password,
  service,
  host = null,
  port = null,
  toEmails,
  subject = null,
  text
) => {
  let transporterConfig;

  if (service === "HOTMAIL") {
    transporterConfig = {
      service: service,
      auth: {
        user: fromEmail,
        pass: password,
      },
    };
  } else {
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
