import express from "express";
import {
  OrderCreation,
  BuySubscription,
  Webhook,
  paymentVerification,
  getWalletHistory,
} from "./payment.services.js";
import { verifyToken } from "../../MiddleWare/VerifyToken.js";
const routes = express.Router();

//payment api
routes.post("/ordercreation", verifyToken, OrderCreation);
routes.post("/paymentverification", paymentVerification);
routes.get("/walletHistory", getWalletHistory);
routes.get("/buysubscription", verifyToken, BuySubscription);
routes.post("/webhooktesting", Webhook);

export default routes;
