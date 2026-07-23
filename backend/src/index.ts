import http from "http";
import app from "./app";
import { setupSocket } from "./socket";

const httpServer = http.createServer(app);
setupSocket(httpServer);

const PORT = 4000;
httpServer.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});