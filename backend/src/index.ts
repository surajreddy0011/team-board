import express from "express";
import http from "http";
import cors from "cors";
import dotenv from "dotenv";
import authRoutes from "./routes/auth";
import workspaceRoutes from "./routes/workspace";
import boardRoutes from "./routes/boards";
import listRoutes from "./routes/lists";
import cardRoutes from "./routes/cards";
import { setupSocket } from "./socket";

dotenv.config();

const app = express();
app.use(cors());
app.use(express.json());

app.get("/", (req, res) => {
  res.json({ message: "Server is alive!" });
});

app.use("/auth", authRoutes);
app.use("/workspaces", workspaceRoutes);
app.use("/workspaces", boardRoutes);
app.use("/", listRoutes);
app.use("/", cardRoutes);

// Socket.io needs a raw HTTP server to attach to — Express alone isn't enough
const httpServer = http.createServer(app);
setupSocket(httpServer);

const PORT = 4000;
httpServer.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});