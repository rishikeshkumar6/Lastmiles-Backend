import express from "express";
import {
  InsertWarehouseRecord,
  getWarehouseRecord,
} from "./warehouse.services.js";
const routes = express.Router();

//warehouse record api
routes.post("/createwarehouse", InsertWarehouseRecord);
routes.get("/warehouseRecord", getWarehouseRecord);

export default routes;
