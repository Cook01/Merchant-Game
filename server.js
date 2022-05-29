// Dependencies
const http = require("http");
const express = require("express");
const path = require("path");
const { Server } = require("socket.io");

// Game Datas
const STARTING_MONEY = 100;

const JSON_ITEMS = require("./src/server/datas/ItemList.json");
const { Item } = require("./src/server");
const { Player } = require("./src/server");

// GLOBAL VARIABLES
const PORT = 3000;


//============================================================= Init Server ========================================================


// Init
const app = express();
const server = http.createServer(app);
const io = new Server(server);


// Setup
app.use("/client", express.static(__dirname + "/src/client"));

// Routing
app.get("/", function(request, response){
    response.sendFile(path.join(__dirname, "/src/client/html/index.html"));
});

// Server Start
server.listen(PORT, function(){
    console.log("Starting server on port " + PORT);
});


//============================================================= Init Game State ========================================================


// List of Items
let itemList = [];
// Read Item List from JSON Data file
for(let item of JSON_ITEMS){
    itemList.push(new Item(item.id, item.name));
}

// List of Players
let playerList = [];

// Market (TMP - To be replaced later)


//============================================================= Player Interactions ========================================================

// New Client connection, set up Player-Server intaractions
io.on("connection", (socket) => {

    //=========================== New Player ==================================

    socket.on("New Player", (pseudo) => {
        // Create new Player
        let newPlayer = new Player(socket, pseudo, Math.round(Math.random() * (99 - 1) + 1));
        // Add new player to Player List
        playerList[socket.id] = newPlayer
        // Send back Player ID
        socket.emit("id", socket.id);

        // Update player
        newPlayer.update();
        // Update LeaderBoard
        updateLeaderBoard();
    });

    //=========================== Player Inputs ==================================

    // Buy
    socket.on("Buy", (itemId, quantity) => {});

    // Sell
    socket.on("Sell", (itemId, quantity) => {});

    // Update Prices
    socket.on("Player Change Item Price", (itemId, priceOffset) => {});

    //=========================== Player Disconnection ==================================

    socket.on('disconnect', () => {
        // If Player ID exist
        if(playerList[socket.id]){
            // Remove Player from Player List
            delete playerList[socket.id];
        }

        console.log(playerList);

        // Update the LeaderBoard
        updateLeaderBoard();
    });

});


//============================================================= Server Interactions ========================================================


// Update LeaderBoard
function updateLeaderBoard(){
    // Init new LeaderBoard
    let leaderBoard = {};

    // Add every players (Score = Money, TBD)
    for(let id in playerList){
        leaderBoard[id] = {
            pseudo: playerList[id].pseudo,
            score: playerList[id].money
        }
    }

    // Broadcast LeaderBoard
    io.emit("Update LeaderBoard", leaderBoard);
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