import twilio from "twilio";
import dotenv from "dotenv";
dotenv.config();

const accountSid = process.env.TWILIO_ACCOUNT_SID;
const authToken = process.env.TWILIO_AUTH_TOKEN;

const sendOtp = async (phonenumber, otpValue) => {
  try {
    const client = twilio(accountSid, authToken);
    const response = await client.messages.create({
      body: `Your Lastmiles Account Verification Otp is ${otpValue} do not share this otp for anyone`,
      from: "+12314987873",
      to: `+91${phonenumber}`,
    });
    return response;
  } catch (err) {
    return err;
  }
};

export default sendOtp;
