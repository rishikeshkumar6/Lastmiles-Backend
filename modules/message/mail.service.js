import nodemailer from "nodemailer";
import { mailtemplate } from "./mail.template.js";
// Step 1: Create a transporter
const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: "rishikeshkumarsingh810@gmail.com",
    pass: "xzin aogw qhmq xeei",
  },
});

export const WelcomeEmail = async (name, email) => {
  try {
    const mailOptions = {
      from: "rishikeshkumarsingh810@gmail.com",
      to: email,
      subject: `Welcome ${name}`,
      text: "This is a test email sent using Nodemailer.",
      html: mailtemplate,
    };
    transporter.sendMail(mailOptions, (error, info) => {
      if (error) {
        console.error("Error:", error);
      } else {
        console.log("Email sent successfully:", info.response);
      }
    });
  } catch (err) {
    console.log(err);
  }
};
