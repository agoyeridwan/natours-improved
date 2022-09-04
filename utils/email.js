const nodemailer = require('nodemailer');
const pug = require('pug');
const { convert } = require('html-to-text');
module.exports = class Email {
  constructor(user, url) {
    this.to = user.email;
    this.firstName = user.name.split(' ')[0];
    this.url = url;
    this.from = `Agoye Ridwan<${process.env.EMAIL_FROM}>`;
  }
  //  creating a transporter function
  newTransport() {
    if (process.env.NODE_ENV === 'production') {
      // sendgrid
      return nodemailer.createTransport({
        service: 'sendGrid',
        auth: {
          user: process.env.SENDGRID_USERNAME,
          pass: process.env.SENDGRID_PASSWORD,
        },
      });
    }
    return nodemailer.createTransport({
      host: process.env.EMAIL_HOST,
      port: process.env.EMAIL_PORT,
      auth: {
        user: process.env.EMAIL_USERNAME,
        pass: process.env.EMAIL_PASSWORD,
      },
      // Activate in gmail "less secure app" option
    });
  }
  // Send the actual email
  async send(template, subject) {
    //1) Render HTML based on a pug template
    // the renderFile creates an html directly instead of creating a template
    const html = pug.renderFile(
      `${__dirname}/../views/emails/${template}.pug`,
      {
        firstname: this.firstName,
        url: this.url,
        subject,
      }
    );
    //2) Define the email options
    const mailOptions = {
      from: this.from,
      to: this.to,
      subject,
      // text is better for email delivery rate and also for spam folders
      text: convert(html, {
        wordwrap: 130,
      }),
      html,
    };
    // 3)Create a transport and send email
    await this.newTransport().sendMail(mailOptions);
    // await transporter.sendMail(mailOptions);
  }
  async sendWelcome() {
    await this.send('welcome', 'Welcome to the natours family!!');
  }
  async sendPasswordReset() {
    await this.send(
      'passwordReset',
      'Your password reset token valid for only 10 minute'
    );
  }
};
// const sendEmail = async (options) => {
//   // 1) Create a transporter

//   // 2) Define email options

//   // 3) Actually send the email with node mailer
//   await transporter.sendMail(mailOptions);
// };
// const nodemailer = require('nodemailer');

// const sendEmail = async (options) => {
//   try {
//     // 1) Create a transporter
//     const transporter = nodemailer.createTransport({
//       host: process.env.EMAIL_HOST,
//       port: process.env.EMAIL_PORT,
//       auth: {
//         user: process.env.EMAIL_USERNAME,
//         pass: process.env.EMAIL_PASSWORD,
//       },
//     });

//     // 2) Define the email options
//     const mailOptions = {
//       from: 'Jonas Schmedtmann <hello@jonas.io>',
//       to: options.email,
//       subject: options.subject,
//       text: options.message,
//       // html:
//     };

//     // 3) Actually send the email
//     await transporter.sendMail(mailOptions);
//     console.log('message sent successfully');
//   } catch (error) {
//     console.log(error);
//   }
// };

// module.exports = sendEmail;
