var nodemailer = require('nodemailer');

var transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: 'ibstodo@gmail.com',
    pass: 'HS-Aalen#4'
  }
});


/* function template(text) {

} */

module.exports = function sendMail(email, text, subject) {
    //TODO: template(text);
    var mailOptions = {
      from: '"IBS-Todo" <ibstodo@gmail.com>',
      to: email,
      subject: subject,
      text: text.join(),
    };

    //console.log("Hallo", mailOptions)
  
    transporter.sendMail(mailOptions, function (error, info) {
      if (error) {
        console.log("error" + error);
      } else {
        console.log("Email sent: " + info.response);
      }
    });
  };
  

