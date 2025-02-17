import express from "express";
import {
  getOrder,
  getAllOrder,
  OrderCreate,
  OrderUpdate,
  pickupCreate,
  bulkOrderCreate,
  aggregation,
} from "./order.services.js";
const routes = express.Router();

//order api
routes.get("/getorder", getOrder);
routes.get("/getAllOrder", getAllOrder);
// routes.get("/ordertracking", orderTracking);
routes.post("/ordercreate", OrderCreate);
routes.put("/orderupdate", OrderUpdate);
routes.post("/pickupcreate", pickupCreate);
routes.post("/bulkorderupload", bulkOrderCreate);
routes.get("/aggregation", aggregation);

export default routes;
