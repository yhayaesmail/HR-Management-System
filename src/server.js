import dotenv from "dotenv";
dotenv.config();

import http from "http";
import { Server } from "socket.io";
import app from "./app.js";
import { initSocket } from "./socket/socket.js";
const PORT = process.env.PORT || 4500;

app.get("/", (req, res) => {
  res.send({ message: "Server is Functional" });
});

const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: (process.env.CORS_ORIGIN || "http://localhost:5173").split(","),
    credentials: true,
  },
});
app.set("io", io);
initSocket(io);

server.listen(PORT, () => {
  console.log(`SERVER IS RUNNING ON PORT ${PORT}`);
});
