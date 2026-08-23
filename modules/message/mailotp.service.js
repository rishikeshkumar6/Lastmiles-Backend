import sgMail from "@sendgrid/mail";
import dotenv from "dotenv";
dotenv.config();
sgMail.setApiKey(process.env.SENDGRID_API_KEY);

export const MailOtp = async (name, email, otp) => {
  console.log("Sending OTP email to:", email);
  console.log("email from:", process.env.Email_From);
  try {
    const msg = {
      to: email,
      from: process.env.Email_From,
      replyTo: process.env.Email_From,
      subject: `Welcome ${name}`,
      text: `Hey ${name}, your OTP is ${otp}. Do not share it with anyone.`,
    };
    console.log("Email message constructed:", msg);

    const response = await sgMail.send(msg);

    console.log("Email sent:", response[0].statusCode);
  } catch (error) {
    console.error("SendGrid Error:", error.response?.body || error);
  }
};
