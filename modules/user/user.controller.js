import express from "express";
import {
  userRegistration,
  userLogin,
  otpVerification,
  getUser,
  getAllUser,
  updateUser,
  deleteUser,
  userLogout,
} from "./user.services.js";
import { verifyToken } from "../../MiddleWare/VerifyToken.js";
const routes = express.Router();

routes.post("/register", userRegistration);
routes.post("/login", userLogin);
routes.post("/logout", userLogout);
// routes.post("/refresh-token", RefreshToken);
routes.put("/otpverification", otpVerification);
routes.get("/read", verifyToken, getUser);
routes.patch("/update/:id", verifyToken, updateUser);
routes.delete("/delete/:id", verifyToken, deleteUser);
routes.get("/querystring", getAllUser);

export default routes;
