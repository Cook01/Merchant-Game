// Enable "require" usage
import { createRequire } from "module";
const require = createRequire(import.meta.url);

// Node Dependencies
const http = require("http");
const express = require("express");
const { Server } = require("socket.io");
const _ = require("lodash");

// Enable __dirname usage
import { fileURLToPath } from 'url';
const path = require("path");
const __dirname = path.dirname(fileURLToPath(import.meta.url))

// Import Utils
import { Random } from "./src/utils/Random.js";
import { Time } from "./src/utils/Time.js";

// Game Datas
const STARTING_MONEY = 100;
import JSON_ITEMS from "./src/server/datas/ItemList.json" assert {type: "json"};

// Customers spawn rate
const CUSTOMER_SPAWN_RATE = {
    MEAN : Time.getSeconds(0, 2), // 2 min
    STD_DEV : Time.getSeconds(0, 1) // 1 min
}
// Customers despawn rate
const CUSTOMER_SHOPING_RATE = {
    MEAN : Time.getSeconds(30), // 30 sec
    STD_DEV : Time.getSeconds(10) // 10 sec
}
// Customers despawn rate
const CUSTOMER_DESPAWN_RATE = {
    MEAN : Time.getSeconds(0, 5), // 5 min
    STD_DEV : Time.getSeconds(0, 1) // 1 min
}

// Wholesale spawn rate
const WHOLESALE_SPAWN_RATE = {
    MEAN : Time.getSeconds(0, 2), // 2 min
    STD_DEV : Time.getSeconds(0, 1) // 1 min
}
// Wholesale despawn rate
const WHOLESALE_DESPAWN_RATE = {
    MEAN : Time.getSeconds(0, 3), // 3 min
    STD_DEV : Time.getSeconds(0, 1) // 1 min
}

// Import Game Modules
import {
    Item,
    Player,
    Customer,
    Wholesale
} from "./src/server/index.js";

// GLOBAL VARIABLES
const PORT = 5000;


//============================================================= Init Server ========================================================


// Init
const app = express();
const server = http.createServer(app);
const io = new Server(server);


// Setup
app.use("/client", express.static(__dirname + "/src/client"));
app.use("/utils", express.static(__dirname + "/src/utils"));

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

// List of Customers
let customerList = [];


// === FOR DEBUG ONLY ===
// // Generate random shopping rate
// let shopping_timer = Random.normal(CUSTOMER_SHOPING_RATE.MEAN, CUSTOMER_SHOPING_RATE.STD_DEV);
// // Generate random despawn rate
// let despawn_timer = Random.normal(CUSTOMER_DESPAWN_RATE.MEAN, CUSTOMER_DESPAWN_RATE.STD_DEV);
// // Generate new Customer
// let new_customer = new Customer(Random.uniformInt(50, 100), shopping_timer, despawn_timer);

// // Generate random wishlist
// new_customer.generateRandomWishlist(itemList);

// // Add new Customer to Customer List
// customerList.push(new_customer);
// ======================


// List of Wholesales
let wholesaleList = [];


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


        // === FOR DEBUG ONLY ===
        // for(let i in itemList)
        //     newPlayer.inventory.addItem(itemList[i], 10, 0);

        // newPlayer.update();
        // ======================


        // Update the LeaderBoard
        // updateLeaderBoard();
        // Update the Customers
        updateCustomers();
    });

    //=========================== Player Inputs ==================================

    // Update Prices
    socket.on("Player Change Item Price", (itemId, new_price) => {
        let player = playerList[socket.id];
        let item = itemList[itemId];

        new_price = parseFloat(new_price);

        if(!isNaN(new_price)){
            new_price = Math.round(new_price);

            if(new_price < 0)
            new_price = 0;

            player.changePrice(item, new_price);
        } else {
            player.update();
        }
    });


    // Player Bid
    socket.on("Player Bid", (wholesaleID, bid) => {
        let player = playerList[socket.id];
        let wholesale = wholesaleList.find((x) => {return x.id == wholesaleID});

        bid = parseFloat(bid);

        if(!isNaN(bid)){
            bid = Math.round(bid);

            if(bid < 0)
                bid = 0;

            if(wholesale != undefined)
                wholesale.addBid(player, bid);
        }

        player.update();
        // updateLeaderBoard();
        updateWholesales();
    });

    //=========================== Player Disconnection ==================================

    socket.on('disconnect', () => {
        // If Player ID exist
        if(playerList[socket.id]){
            // Remove Player from Player List
            delete playerList[socket.id];

            // Remove Player from Wholesales Bids
            for(let wholesale of wholesaleList){
                for(let i in wholesale.bidList){
                    if(wholesale.bidList[i].player.getID() == socket.id){
                        wholesale.bidList.splice(i, 1);
                    }
                }
            }
        }

        // Update the LeaderBoard
        // updateLeaderBoard();
        updateWholesales();
    });

});


//============================================================= Server Interactions ========================================================


// Update LeaderBoard
// function updateLeaderBoard(){
//     // Init new LeaderBoard
//     let leaderBoard = {};

//     // Add every players (Score = Money, TBD)
//     for(let id in playerList){
//         leaderBoard[id] = {
//             pseudo: playerList[id].pseudo,
//             score: playerList[id].money
//         }
//     }

//     // Broadcast LeaderBoard
//     io.emit("Update LeaderBoard", leaderBoard);
// }

// Update Customers
function updateCustomers(){
    io.emit("Update Customers", customerList);
}

// Update Wholesale
function updateWholesales(){

    let wholesaleListSendable =  [];
    
    for(let wholesale of wholesaleList){
        let wholesaleSendable = _.cloneDeep(wholesale);

        for(let i in wholesaleSendable.bidList){
            wholesaleSendable.bidList[i].player.id = wholesaleSendable.bidList[i].player.getID();
            delete wholesaleSendable.bidList[i].player.socket;
        }

        wholesaleListSendable.push(wholesaleSendable);
    }

    io.emit("Update Wholesales", wholesaleListSendable);
}


//============================================================= Main Loop ========================================================

// Init First Spawn Cooldowns
let customer_spawn_cooldown = Random.normal(CUSTOMER_SPAWN_RATE.MEAN, CUSTOMER_SPAWN_RATE.STD_DEV);
let wholesale_spawn_cooldown = Time.getSeconds(1);

// Every seconds
setInterval(() => {

    //=============================================================

    // Customer spawn
    // If Customer Spawn Timer has ended
    if(customer_spawn_cooldown <= 0){
        // Generate random shopping rate
        let shopping_timer = Random.normal(CUSTOMER_SHOPING_RATE.MEAN, CUSTOMER_SHOPING_RATE.STD_DEV);
        // Generate random despawn rate
        let despawn_timer = Random.normal(CUSTOMER_DESPAWN_RATE.MEAN, CUSTOMER_DESPAWN_RATE.STD_DEV);
        // Generate new Customer
        let new_customer = new Customer(Random.uniformInt(50, 100), shopping_timer, despawn_timer);

        // Generate random wishlist
        new_customer.generateRandomWishlist(itemList);

        // Add new Customer to Customer List
        customerList.push(new_customer);

        // Server Log
        console.log("New Customer");

        // Reset Cooldown
        customer_spawn_cooldown = Random.normal(CUSTOMER_SPAWN_RATE.MEAN, CUSTOMER_SPAWN_RATE.STD_DEV);
    } else {
        // Decrement Cooldown Timers
        customer_spawn_cooldown--;
    }

    // Handle Customer Actions (Shopping and Despawn)
    // For each Customer
    for(let i in customerList){

        // Shopping
        // If Shopping Timer has ended
        if(customerList[i].shopping_timer <= 0){
            // Customer Shop
        customerList[i].shop(playerList);

            // Server Log
            console.log("Customer Shop");

            // Reset Shoping Timer
            customerList[i].shopping_timer = Random.normal(CUSTOMER_SHOPING_RATE.MEAN, CUSTOMER_SHOPING_RATE.STD_DEV);
        } else {
            // Decrement Shoping Timers
            customerList[i].shopping_timer--;
        }


        // Despawn
        // If Despawn Timer has ended OR no more Items in Wishlist
        if(customerList[i].despawn_timer <= 0 || Object.keys(customerList[i].wishlist).length == 0){
            // Remove Customer from List
            customerList.splice(i, 1);

            // Server Log
            console.log("Customer leave");
        } else {
            // Decrement Shoping Timers
            customerList[i].despawn_timer--;
        }
    }

    //=============================================================

    // Wholesale Spawn
    // If Wholesale Spawn Timer has ended
    if(wholesale_spawn_cooldown <= 0){
        // Generate Wholesale ID
        let id = new Date().getTime();
        // Generate deswpan rate
        let despawn_timer = Random.normal(WHOLESALE_DESPAWN_RATE.MEAN, WHOLESALE_DESPAWN_RATE.STD_DEV);
        // Create new Wholesale and push it to Wholesale List
        wholesaleList.push(Wholesale.generateRandomWholesale(id, itemList, despawn_timer));

        // Reset Cooldown
        wholesale_spawn_cooldown = Random.normal(WHOLESALE_SPAWN_RATE.MEAN, WHOLESALE_SPAWN_RATE.STD_DEV);

        // Server Log
        console.log("New Wholesale");
    } else {
        wholesale_spawn_cooldown--;
    }

    // Despawn ended Wholesales
    // For each Wholesale
    for(let i in wholesaleList){
        // If Despawn Timer has ended
        if(wholesaleList[i].despawn_timer <= 0){
            // End the Bidding
            wholesaleList[i].endBid();

            // Remove the Wholesale
            wholesaleList.splice(i, 1);

            // Update all players
            for(let i in playerList){
                playerList[i].update();
            }
            
            // Server Log
            console.log("End Wholesale");
        } else {
            // Decrement the Despawn Timer
            wholesaleList[i].despawn_timer--;
        }
    }

    //=============================================================

    // Update Customes
    updateCustomers();
    // Update Leader Board
    // updateLeaderBoard();
    // Update Wholesale
    updateWholesales();
}, 1000);