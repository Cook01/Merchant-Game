//Dependencies
const http = require("http");
const express = require("express");
const path = require("path");
const { Server } = require("socket.io");

//GLOBAL VARIABLES
const PORT = 3000;


//============================================================= Init Server ========================================================


//Init
const app = express();
const server = http.createServer(app);
const io = new Server(server);


//Setup
app.use("/client", express.static(__dirname + "/src/client"));

//Routing
app.get("/", function(request, response){
    response.sendFile(path.join(__dirname, "/src/client/html/index.html"));
});

//Server Start
server.listen(PORT, function(){
    console.log("Starting server on port " + PORT);
});


//============================================================= Init Game State ========================================================


// List of Items
// List of Players
// Market (TMP - To be replaced later)


//============================================================= Player Interactions ========================================================

// New Client connection, set up Player-Server intaractions
io.on("connection", (socket) => {

    //=========================== New Player ==================================

    socket.on("New Player", (pseudo) => {
        // Send back Player ID
        socket.emit("id", socket.id);
    });

    //=========================== Player Inputs ==================================

    // Buy
    socket.on("Buy", (itemId, quantity) => {});

    // Sell
    socket.on("Sell", (itemId, quantity) => {});

    // Update Prices
    socket.on("Player Change Item Price", (itemId, priceOffset) => {});

    //=========================== Update Player Infos ==================================

    // Player Inventory
    socket.emit("Update Player", null);

    //=========================== Player Disconnection ==================================

    socket.on('disconnect', () => {});

});


//============================================================= Server Interactions ========================================================


// Update LeaderBoard
function updateLeaderBoard(){
    io.emit("Update LeaderBoard", null);
}

// Update Market (TMP - To be replaced)
function updateMarket(){
    io.emit("Update Market", null);
}

// Update Customers
function updateCustomers(){
    io.emit("Update Villagers", null);
}

// Generate new Customers