// require("dotenv").config();
// var nodemailer = require("nodemailer");

// var transporter = nodemailer.createTransport({
//   //   service: 'yahoo',
//   //   host: 'smtp.mail.yahoo.com',
//   //   port: 465,
//   //   secure: false,
//   host: "smtp.gmail.com",
//   port: 465,
//   auth: {
//     user: "the.josephfernando@gmail.com",
//     pass: "bhqasrtokuctuzfi",
//   },
// });

// var mailOptions = {
//   from: "the.josephfernando@gmail.com",
//   to: process.env.YAHOO_EMAIL,
//   subject: "Sending Email using Node.js",
//   text: "That was easy!",
// };

// transporter.sendMail(mailOptions, function (error, info) {
//   if (error) {
//     console.log(error);
//   } else {
//     console.log("Email sent: " + info.response);
//   }
// });
