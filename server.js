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
const { Market } = require("./src/server");

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
let itemList = {};
// Read Item List from JSON Data file
for(let item of JSON_ITEMS){
    itemList[item.id] = (new Item(item.id, item.name));
}

// List of Players
let playerList = {};

// Market (TMP - To be replaced later)
let market = new Market();
for(let id in itemList)
    market.addItem(itemList[id], 100, 1);


//============================================================= Player Interactions ========================================================


// New Client connection, set up Player-Server intaractions
io.on("connection", (socket) => {

    //=========================== New Player ==================================

    socket.on("New Player", (pseudo) => {
        // Send back Player ID
        socket.emit("id", socket.id);

        // Create new Player
        let newPlayer = new Player(socket, pseudo, STARTING_MONEY);
        // Add new player to Player List
        playerList[socket.id] = newPlayer

        // Update LeaderBoard
        updateLeaderBoard();
        updateMarket();
    });

    //=========================== Player Inputs ==================================

    // Buy
    socket.on("Buy", (itemId, quantity) => {
        // Get Player
        let player = playerList[socket.id];
        // Get Item
        let item = itemList[itemId];

        // Check if Quantity is a number
        quantity = parseInt(quantity);
        if (isNaN(quantity))
            quantity = 0

        // Check if Quantity is >= 0
        if(quantity < 0)
            quantity = 0

        // Buy Item from Market
        player.buy(market, item, quantity);

        // Update the Market
        updateMarket();
        // Update the LeaderBoard
        updateLeaderBoard();
    });

    // Sell
    socket.on("Sell", (itemId, quantity) => {
        let player = playerList[socket.id];
        let item = itemList[itemId];

        // Check if Quantity is a number
        quantity = parseInt(quantity);
        if (isNaN(quantity))
            quantity = 0

        // Check if Quantity is >= 0
        if(quantity < 0)
            quantity = 0

        // Sell Item to Market
        player.sell(market, item, quantity);

        // Update the Market
        updateMarket();
        // Update the LeaderBoard
        updateLeaderBoard();
    });

    // Update Prices
    socket.on("Player Change Item Price", (itemId, priceOffset) => {
        let player = playerList[socket.id];
        let item = itemList[itemId];
        let newPrice = player.inventory.getPrice(item) + priceOffset;

        player.changePrice(item, newPrice);
    });

    //=========================== Player Disconnection ==================================

    socket.on('disconnect', () => {
        // If Player ID exist
        if(playerList[socket.id]){
            // Remove Player from Player List
            delete playerList[socket.id];
        }

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
    io.emit("Update Market", market);
}

// Update Customers
function updateCustomers(){
    io.emit("Update Villagers", null);
}

// Generate new Customers