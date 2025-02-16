import twilio from "twilio";
import dotenv from "dotenv";
dotenv.config();
const accountSid = process.env.TWILIO_ACCOUNT_SID; // Your Account SID from www.twilio.com/console
const authToken = process.env.TWILIO_AUTH_TOKEN; // Your Auth Token from www.twilio.com/console
const client = new twilio(accountSid, authToken);
console.log("client", client);
console.log("dotenv sid and token", accountSid, authToken);

const sendWhatsAppMessage = async (to, body, buttons = []) => {
  let messageData = {
    from: "whatsapp:+14155238886", // Your Twilio Sandbox WhatsApp number
    to: `whatsapp:+916207654176`,
    body: "Hey i am Rishikesh Kumar Singh",
  };

  const response = await client.messages.create(messageData);
  console.log(response);
};

sendWhatsAppMessage();
