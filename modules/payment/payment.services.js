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
    return res.status(400).send({ err });
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

async function create2MonthPlan() {
  try {
    const plan = await instance.plans.create({
      period: "monthly",
      interval: 2, // Bills every 2 months
      item: {
        name: "Yearly Plan (6 Cycles)",
        amount: 59900, // ₹599 per 2 months
        currency: "INR",
      },
      notes: {
        description: "Billed every 2 months, total 6 cycles/year",
      },
    });
    return plan.id; // Save this plan_id
  } catch (err) {
    console.error("Plan creation error:", err);
  }
}

// Backend: Create customer first
export const BuySubscription = async (req, res) => {
  try {
    // Create customer
    const customer = await instance.customers.create({
      name: "Rishikesh Kumar Singh",
      email: "rishikesh.kumar@gmail.com",
      contact: "6207654176",
    });
    console.log("what thing returns inside the customer", customer);
    // Create plan
    const plan_id = await create2MonthPlan();
    console.log(plan_id);
    // Create subscription with customer ID
    const response = await instance.subscriptions.create({
      plan_id: plan_id,
      customer_id: customer.id, // Add this
      customer_notify: 1,
      total_count: 6,
      expire_by: Math.floor(Date.now() / 1000) + 31536000,
    });

    res.status(200).json({ response });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: err.error.description });
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
