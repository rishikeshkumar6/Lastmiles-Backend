import sgMail from "@sendgrid/mail";
import dotenv from "dotenv";
dotenv.config();
sgMail.setApiKey(process.env.SENDGRID_API_KEY);

export const MailOtp = async (name, email, otp) => {
  try {
    const msg = {
      to: email,
      from: process.env.EMAIL_FROM,
      replyTo: process.env.EMAIL_FROM,
      subject: `Welcome ${name}`,
      text: `Hey ${name}, your OTP is ${otp}. Do not share it with anyone.`,
    };

    const response = await sgMail.send(msg);

    console.log("Email sent:", response[0].statusCode);
  } catch (error) {
    console.error("SendGrid Error:", error.response?.body || error);
  }
};
