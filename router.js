import express from "express";
import { RefreshToken, verifyToken } from "./MiddleWare/VerifyToken.js";
import userContoller from "./modules/user/user.controller.js";
import warehouseController from "./modules/warehouse/warehouse.controller.js";
import paymentController from "./modules/payment/payment.controller.js";
import orderController from "./modules/order/order.controller.js";

const routes = express.Router();

routes.use(userContoller);
routes.use(orderController);
routes.use(paymentController);
routes.use(warehouseController);

export default routes;
