import express from "express";
import {
  deleteUser,
  getAllUser,
  getUser,
  otpVerification,
  updateUser,
  userLogin,
  userRegistration,
} from "./modules/user/user.controller.js";
import {
  getWarehouseRecord,
  InsertWarehouseRecord,
} from "./modules/warehouse/warehouse.controller.js";
import { userRegisterSchema } from "./modules/user/user.auth.js";
import { RefreshToken, verifyToken } from "./MiddleWare/VerifyToken.js";
import {
  BuySubscription,
  OrderCreation,
  PaymentVerification,
  Webhook,
} from "./modules/payment/payment.controller.js";
import {
  getOrder,
  getAllOrder,
  OrderCreate,
  OrderUpdate,
  pickupCreate,
  aggregation,
  bulkOrderCreate,
} from "./modules/order/order.controller.js";

const routes = express.Router();

//user api
routes.post("/register", userRegistration);
routes.post("/login", userLogin);
// routes.post("/refresh-token", RefreshToken);
routes.put("/otpverification", otpVerification);
routes.get("/read", verifyToken, getUser);
routes.patch("/update/:id", verifyToken, updateUser);
routes.delete("/delete/:id", verifyToken, deleteUser);
routes.get("/querystring", getAllUser);

//payment api
routes.post("/ordercreation", OrderCreation);
routes.post("/paymentverification", PaymentVerification);
routes.get("/buysubscription", BuySubscription);
routes.post("/webhooktesting", Webhook);

//order api
routes.get("/getorder", getOrder);
routes.get("/getAllOrder", getAllOrder);
// routes.get("/ordertracking", orderTracking);
routes.post("/ordercreate", OrderCreate);
routes.put("/orderupdate", OrderUpdate);
routes.post("/pickupcreate", pickupCreate);
routes.post("/bulkorderupload", bulkOrderCreate);
routes.get("/aggregation", aggregation);

//warehouse record api
routes.post("/createwarehouse", InsertWarehouseRecord);
routes.get("/warehouseRecord", getWarehouseRecord);

export default routes;
