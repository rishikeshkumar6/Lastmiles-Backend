import express from "express";
import multer from "multer";
import { v4 as uuidv4 } from "uuid";
import { v2 as cloudinary } from "cloudinary";
import { ProductImage } from "./image.service.js";
import dotenv from "dotenv";
const app = express();
app.use("/Destination", express.static("Destination"));

dotenv.config();

cloudinary.config({
  cloud_name: process.env.CLOUDANARY_NAME,
  api_key: process.env.CLOUDANARY_API_KEY,
  api_secret: process.env.CLOUDANARY_SECRET_KEY,
});

const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, "./Destination");
  },
  filename: function (req, file, cb) {
    console.log("req", req);
    console.log("file", file);
    const random = uuidv4();
    cb(null, random + "" + file.originalname);
  },
});
const uploads = multer({ storage: storage });
const routes = express.Router();

routes.post("/productimage", uploads.single("imageupload"), ProductImage);

export default routes;
