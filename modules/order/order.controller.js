import express from "express";
import {
  getOrder,
  getAllOrder,
  OrderCreate,
  OrderUpdate,
  pickupCreate,
  bulkOrderCreate,
  aggregation,
  generateLabel,
  shippingOrder,
  getAllPickup,
  ManageProduct,
  updateProduct,
  deleteProduct,
  updatePickupStatus,
  updatePickup,
  deletePickup,
  DeleteOrder,
  freightRate,
  RateCard,
} from "./order.services.js";
import { verifyToken } from "../../MiddleWare/VerifyToken.js";
const routes = express.Router();

//order api
routes.get("/getorder", verifyToken, getOrder);
routes.get("/getAllOrder", verifyToken, getAllOrder);
// routes.get("/ordertracking", orderTracking);
routes.post("/ordercreate", verifyToken, OrderCreate);
routes.put("/orderupdate", verifyToken, OrderUpdate);
routes.post("/deleteOrder", verifyToken, DeleteOrder);
routes.post("/pickupcreate", verifyToken, pickupCreate);
routes.get("/getAllProduct", verifyToken, ManageProduct);
routes.post("/updateProduct", verifyToken, updateProduct);
routes.post("/deleteProduct", verifyToken, deleteProduct);
routes.get("/getAllPickup", verifyToken, getAllPickup);
routes.post("/deletePickup", verifyToken, deletePickup);
routes.post("/updatePickupStatus", verifyToken, updatePickupStatus);
routes.post("/updatePickup", verifyToken, updatePickup);

routes.post("/bulkorderupload", verifyToken, bulkOrderCreate);
routes.post("/generateLabel", verifyToken, generateLabel);
routes.post("/shipping_order", verifyToken, shippingOrder);
routes.get("/aggregation", verifyToken, aggregation);
routes.post("/freight_rate", freightRate);
routes.post("/ratecard", RateCard);

export default routes;
