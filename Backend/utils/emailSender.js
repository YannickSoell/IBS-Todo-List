var nodemailer = require("nodemailer");
//nodemailer is for email notifaction and sending. We use a new Google mail adress
var transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: "ibstodo@gmail.com",
    pass: "HS-Aalen#4",
  },
});

module.exports = function sendMail(email, text, subject) {
  var mailOptions = {
    from: '"IBS-Todo" <ibstodo@gmail.com>',
    to: email,
    subject: subject,
    text: text.join(),
  };

  transporter.sendMail(mailOptions, function (error, info) {
    if (error) {
      console.log("error" + error);
    } else {
      console.log("Email sent: " + info.response);
    }
  });
};
