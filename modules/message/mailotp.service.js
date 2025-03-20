import nodemailer from "nodemailer";
// Step 1: Create a transporter
const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: "rishikeshkumarsingh810@gmail.com",
    pass: "xzin aogw qhmq xeei",
  },
});

export const MailOtp = async (name, email, otp) => {
  try {
    const mailOptions = {
      from: "rishikeshkumarsingh810@gmail.com",
      to: email,
      subject: `Welcome ${name}`,
      text: `Hey ${name} Your one time password is ${otp} do not share anyone with this otp`,
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
