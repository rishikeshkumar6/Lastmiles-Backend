import twilio from "twilio";
import dotenv from "dotenv";
dotenv.config();

const accountSid = process.env.TWILIO_ACCOUNT_SID;
const authToken = process.env.TWILIO_AUTH_TOKEN;

const client = twilio(accountSid, authToken);

export const validatePhoneNumber = async (phone) => {
  try {
    const response = await client.lookups.v2
      .phoneNumbers(phone)
      .fetch({ type: ["carrier"] });
    return response.valid; // Returns true if the number is real
  } catch (error) {
    return false; // Invalid number
  }
};

export const sendOtp = async (phonenumber, otpValue) => {
  try {
    await client.messages.create({
      body: `Your Lastmiles Account Verification Otp is ${otpValue} do not share this otp for anyone`,
      from: "+12314987873",
      to: `+91${phonenumber}`,
    });
    return { success: true, message: "sms send successfully" };
  } catch (err) {
    return { success: false, errorMessage: err.message.split(".")[0] };
  }
};
