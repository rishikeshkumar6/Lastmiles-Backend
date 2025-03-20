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
  forgotPassword,
  forgotPasswordOtpVerification,
  UpdatePassword,
} from "./user.services.js";
import { verifyToken } from "../../MiddleWare/VerifyToken.js";
const routes = express.Router();

routes.post("/register", userRegistration);
routes.post("/login", userLogin);
routes.post("/logout", userLogout);
// routes.post("/refresh-token", RefreshToken);
routes.put("/otpverification", otpVerification);
routes.post("/forgotpassword", forgotPassword);
routes.post(
  "/passowrdotpverification",
  verifyToken,
  forgotPasswordOtpVerification
);
routes.put("/updatepassword", verifyToken, UpdatePassword);

routes.get("/read", verifyToken, getUser);
routes.patch("/update/:id", verifyToken, updateUser);
routes.delete("/delete/:id", verifyToken, deleteUser);
routes.get("/querystring", getAllUser);

export default routes;
