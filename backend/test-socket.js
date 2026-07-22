const { io } = require("socket.io-client");

const socket = io("http://localhost:4000");

socket.on("connect", () => {
  console.log("Connected! Joining board 1...");
  socket.emit("join-board", 1);
});

socket.on("card-moved", (data) => {
  console.log("🔴 LIVE UPDATE received:", data);
});