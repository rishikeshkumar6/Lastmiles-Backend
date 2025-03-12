import express from "express";
import { createTestShipment } from "./dhl.service.js";
const routes = express.Router();

routes.post("/create-shipment", createTestShipment);

export default routes;
