import nodemailer from "nodemailer";

const transporter = nodemailer.createTransport({
  host: "smtp.ethereal.email",
  port: 587,
  secure: false, // true for port 465, false for other ports
  auth: {
    user: process.env.MAIN_EMAIL,
    pass: process.env.MAIN_EMAIL_PASSWORD
  },
});

export class MailManager {
  static sendMail = async (emailTemplate) => {
    const { to, subject, text, html } = emailTemplate;
    console.log(transporter)
      return await transporter.sendMail({
        from: process.env.MAIN_EMAIL,
        to,
        subject,
        text,
        html,
      });
    }
}