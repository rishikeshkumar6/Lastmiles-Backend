import { instance } from "../../index.js";
import crypto from "crypto";
export const OrderCreation = async (req, res) => {
  try {
    console.log("request body-----", req.body);
    const { amount } = req.body;
    const orders = await instance.orders.create({
      amount: amount * 100,
      currency: "INR",
      receipt: "R19ET1CS0039",
    });
    console.log("orders checking----", orders);
    return res.status(200).send({
      paymentRes: { ...orders, key: process.env.RAZORPAY_API_KEY },
    });
  } catch (err) {
    console.log(err);
    return res
      .status(500)
      .send({ errorMessage: `${err} Internal Server Error` });
  }
};

export const PaymentVerification = async (req, res) => {
  try {
    console.log("secret key", process.env.RAZORPAY_SECRET_KEY);
    const { razorpay_order_id, razorpay_payment_id, razorpay_signature } =
      req.body;
    const generatedSignature = crypto
      .createHmac("sha256", process.env.RAZORPAY_SECRET_KEY)
      .update(razorpay_order_id + "|" + razorpay_payment_id)
      .digest("hex");

    if (generatedSignature === razorpay_signature) {
      return res.send(200, { paymentRes: "payment verify successfull" });
    } else {
      return res.send(401, { errorMessage: "payment verifaction failed" });
    }
  } catch (err) {
    console.log(err);
    res.send(500, { errorMessage: `${err} Internal Server Error` });
  }
};

export const BuySubscription = async (req, res) => {
  try {
    const response = await instance.subscriptions.create({
      plan_id: process.env.RAZORPAY_PLAN_ID,
      customer_notify: 1,
      total_count: 1,
    });
    console.log(response);
    res.send(200, { response });
  } catch (err) {
    res.send(500, { errorMessage: "Internal Server Error" });
  }
};

export const Webhook = async (req, res) => {
  try {
    const webhookBody = req.body;
    const webhookSignature = req.headers["x-razorpay-signature"];
    console.log("webhookBody", JSON.stringify(webhookBody));
    console.log("webhook signature", webhookSignature);

    const generatedSignature = crypto
      .createHmac("sha256", process.env.RAZORPAY_Webhook_SECRET_KEY)
      .update(JSON.stringify(req.body))
      .digest("hex");

    console.log("generated signature", generatedSignature);

    if (generatedSignature === webhookSignature) {
      const { event, payload } = webhookBody;
      if (event === "payment.captured") {
        const { payment_id, order_id } = payload.payment.entity;
        console.log("payment id and order id ", payment_id, order_id);
        console.log("payment received successfully");
        return res
          .status(200)
          .send({ message: "payment received successfully" });
      }
    } else {
      console.error("Webhook signature verification failed");
      return res.status(400).send({ message: "Invalid signature" });
    }
  } catch (err) {
    console.error("Internal Server Error", err);
    return res.status(500).send({ errorMessage: "Internal Server Error" });
  }
};
