import express from "express";
import "./DB/config.js";
import { dbConnect } from "./DB/config.js";
import cookieParser from "cookie-parser";
import cors from "cors";
import dotenv from "dotenv";
import routes from "./router.js";
import Razorpay from "razorpay";
import { createServer } from "http";
import { Server } from "socket.io";
// Load environment variables
dotenv.config();

// Export variable for Razorpay instance
export let instance;

// Initialize Razorpay instance in workers
instance = new Razorpay({
  key_id: process.env.RAZORPAY_API_KEY,
  key_secret: process.env.RAZORPAY_SECRET_KEY,
});

const app = express();
const port = process.env.PORT || 5000;
const server = createServer(app);
const io = new Server(server, {
  cors: {
    origin: process.env.REACT_APP_DEVELOPEMENT_URL,
    methods: ["GET", "POST"],
    credentials: true,
  },
});
const allowedOrigins = [process.env.REACT_APP_DEVELOPEMENT_URL];

app.use(
  cors({
    origin: function (origin, callback) {
      if (!origin || allowedOrigins.includes(origin)) {
        callback(null, true);
      } else {
        callback(new Error("Not allowed by CORS"));
      }
    },
    credentials: true, // Allow cookies to be sent
  }),
);
app.use(express.json());
app.use(express.urlencoded({ extended: true })); // Parse URL-encoded data
app.use(cookieParser());
app.get("/health", async (req, res) => {
  return res.status(200).json({ status: "OK" });
});
app.use("/api/v1", routes);

// --- SOCKET.IO EVENTS ---
io.on("connection", (socket) => {
  console.log("User connected:", socket.id);
  // Join a room (e.g., when a user joins a chat room)
  socket.on("join_room", (room) => {
    socket.join(room);
    console.log(`User ${socket.id} joined room ${room}`);
  });

  // Broadcast to a specific room (e.g., chat message)
  socket.on("send_message", (data) => {
    // Send to everyone in the room INCLUDING the sender
    io.to(data.room).emit("receive_message", data);

    // Send to everyone in the room EXCEPT the sender
    // socket.to(data.room).emit("receive_message", data);
  });

  // Broadcast to all clients except sender (global)
  socket.on("global_event", (data) => {
    socket.broadcast.emit("global_response", data);
  });

  socket.on("disconnect", () => {
    console.log("User disconnected:", socket.id);
  });
});

server.listen(port, () => {
  console.log(`Server is running on port ${port}, PID: ${process.pid}`);
});

dbConnect();
