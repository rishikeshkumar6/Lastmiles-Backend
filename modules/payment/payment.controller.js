import express from "express";
import {
  OrderCreation,
  PaymentVerification,
  BuySubscription,
  Webhook,
} from "./payment.services.js";
const routes = express.Router();

//payment api
routes.post("/ordercreation", OrderCreation);
routes.post("/paymentverification", PaymentVerification);
routes.get("/buysubscription", BuySubscription);
routes.post("/webhooktesting", Webhook);

export default routes;
