import express from "express";
import "./DB/config.js";
import { dbConnect } from "./DB/config.js";
import cookieParser from "cookie-parser";
import cors from "cors";
import dotenv from "dotenv";
import routes from "./router.js";
import os from "os";
import cluster from "cluster";
import Razorpay from "razorpay";

// Load environment variables
dotenv.config();

// Export variable for Razorpay instance
export let instance;

if (cluster.isMaster) {
  const cpuLength = os.cpus().length;

  for (let i = 0; i < cpuLength; i++) {
    const worker = cluster.fork();
    console.log("Worker PID:", worker.process.pid);
  }

  cluster.on("exit", (worker, code, signal) => {
    console.log(
      `Worker ${worker.process.pid} exited with code ${code}, signal ${signal}`
    );
    console.log("Starting a new worker...");
    cluster.fork();
  });
} else {
  // Initialize Razorpay instance in workers
  instance = new Razorpay({
    key_id: process.env.RAZORPAY_API_KEY,
    key_secret: process.env.RAZORPAY_SECRET_KEY,
  });

  const app = express();
  const port = process.env.PORT || 5000;

  app.use(
    cors({
      origin: "http://localhost:3000", // Allow only your frontend origin
      credentials: true, // Allow cookies to be sent
    })
  );
  app.use(express.json());
  app.use(express.urlencoded({ extended: true })); // Parse URL-encoded data
  app.use(cookieParser());
  app.use("/api/v1", routes);

  app.listen(port, () => {
    console.log(`Server is running on port ${port}, PID: ${process.pid}`);
  });

  dbConnect();
}
