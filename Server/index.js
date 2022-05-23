const express = require("express");
const app = express();
const http = require("http");
const server = http.createServer(app);
const { Server } = require("socket.io");
const io = new Server(server);

//Route index.html
app.get("/", (req, res) => {
    res.sendFile(__dirname + "/client/index.html");
});


//On client connection
io.on("connection", (socket) => {
    //Do things
});


//Open server on port 3000
server.listen(3000, () => {});