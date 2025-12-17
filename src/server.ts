import http from "http";
import { Server } from "socket.io";
import app from "./app.js";

const PORT = process.env.PORT || 5000;
const server = http.createServer(app);

export const io = new Server(server, {
  cors: { origin: process.env.FRONTEND_URL, credentials: true },
});

io.on("connection", (socket) => {
  console.log("Client connected:", socket.id);
  socket.on("disconnect", () => console.log("Client disconnected:", socket.id));
});

server.listen(PORT, () => console.log(`Server running on port ${PORT}`));
