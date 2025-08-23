import { instance } from "../../index.js";
import crypto from "crypto";
import { sequelize } from "../../DB/config.js";
import { paymentHistoryModel, walletModel } from "./payment.model.js";

// Helper function for consistent date formatting
const formatDateTime = (date) => {
  console.log("date", date);
  return date.toISOString().slice(0, 19).replace("T", " ");
};

// Helper function for signature verification
const verifyRazorpaySignature = (orderId, paymentId, signature, secret) => {
  const generatedSignature = crypto
    .createHmac("sha256", secret)
    .update(`${orderId}|${paymentId}`)
    .digest("hex");

  return generatedSignature === signature;
};
export const OrderCreation = async (req, res) => {
  try {
    const { id } = req.user["response"];
    const { amount } = req.body;
    const orders = await instance.orders.create({
      amount: amount * 100,
      currency: "INR",
      receipt: "R19ET1CS0039",
    });
    console.log("orders checking----", orders);
    return res.status(200).send({
      paymentRes: {
        ...orders,
        key: process.env.RAZORPAY_API_KEY,
        account_id: id,
      },
    });
  } catch (err) {
    console.log(err);
    return res.status(400).send({ err });
  }
};

export const paymentVerification = async (req, res) => {
  const transaction = await sequelize.transaction();

  try {
    const {
      razorpay_order_id,
      razorpay_payment_id,
      razorpay_signature,
      paymentRes,
    } = req.body;

    // Validate required fields
    const requiredFields = [
      "razorpay_order_id",
      "razorpay_payment_id",
      "razorpay_signature",
      "paymentRes",
    ];

    const missingFields = requiredFields.filter((field) => !req.body[field]);
    if (missingFields.length > 0) {
      return res.status(400).json({
        error: "Missing required fields",
        missing: missingFields,
      });
    }

    // Destructure paymentRes with validation
    const {
      amount,
      created_at: createdAtUnix,
      currency,
      id: orderId,
      account_id: accountId,
    } = paymentRes;

    if (!amount || !createdAtUnix || !accountId) {
      return res.status(400).json({ error: "Invalid payment response data" });
    }

    // Verify payment signature
    if (!process.env.RAZORPAY_SECRET_KEY) {
      throw new Error("Razorpay secret key not configured");
    }

    const isValidSignature = verifyRazorpaySignature(
      razorpay_order_id,
      razorpay_payment_id,
      razorpay_signature,
      process.env.RAZORPAY_SECRET_KEY
    );

    if (!isValidSignature) {
      return res.status(401).json({ error: "Payment verification failed" });
    }

    // Convert amount to base units (e.g., paise to rupees)
    const normalizedAmount = amount / 100;
    console.log("normalizedAmount", normalizedAmount);
    const createdAt = new Date(createdAtUnix * 1000);
    const transactionId = `${Date.now().toString()}-${accountId}`; // More collision-resistant ID

    // Update or create wallet
    const [wallet] = await walletModel.findOrCreate({
      where: { account_id: accountId },
      defaults: { amount: 0, accountId, order_id: orderId },
      transaction,
      lock: true,
    });

    const updatedBalance = wallet.amount + normalizedAmount;
    await wallet.update({ amount: updatedBalance }, { transaction });

    // Create payment history
    await paymentHistoryModel.create(
      {
        date: formatDateTime(createdAt),
        account_id: accountId,
        transaction_id: transactionId,
        order_id: orderId,
        transaction_type: "WALLET_RECHARGE",
        credit_amount: normalizedAmount,
        debit_amount: 0,
        wallet_balance: updatedBalance,
        payment_status: "SUCCESS",
        currency: currency || "INR", // Default currency
      },
      { transaction }
    );

    await transaction.commit();

    return res.status(200).json({
      success: true,
      message: "Transaction successful",
      transactionId,
      newBalance: updatedBalance,
    });
  } catch (error) {
    await transaction.rollback();

    // Log detailed error for debugging
    console.error(`Payment verification failed: ${error.message}`, {
      body: req.body,
      errorStack: error.stack,
    });

    return res.status(500).json({
      statusCode: 500,
      error: "Transaction processing failed",
      message: error.message,
    });
  }
};

export const getWalletHistory = async (req, res) => {
  try {
    const { page, batchSize } = req.query;
    const { id } = req.user["response"];
    const offset = ((parseInt(page) || 1) - 1) * (batchSize || 1);
    const pageCount = await paymentHistoryModel.findAndCountAll({
      where: { account_id: id },
    });
    const walletResponse = await paymentHistoryModel.findAll({
      offset: offset,
      limit: batchSize,
      where: { account_id: id },
    });
    const totalPage = Math.ceil(pageCount.count / (batchSize || 10));
    res.status(200).json({
      statusCode: 200,
      walletResponse,
      totalPage,
    });
  } catch (err) {
    console.log(err);
    res
      .status(500)
      .json({ statusCode: 500, errorMessage: "internal server error" });
  }
};

async function create2MonthPlan() {
  try {
    const plan = await instance.plans.create({
      period: "monthly",
      interval: 1, // Bills every 2 months
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
      total_count: 1,
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
      console.error("payment failed");
      return res.status(400).send({ message: "Invalid signature" });
    }
  } catch (err) {
    console.error("Internal Server Error", err);
    return res.status(500).send({ errorMessage: "Internal Server Error" });
  }
};
