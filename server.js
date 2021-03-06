// Enable "require" usage
import { createRequire } from "module";
const require = createRequire(import.meta.url);

// Node.js Dependencies
const http = require("http");
const express = require("express");
const { Server } = require("socket.io");

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
    STD_DEV : Time.getSeconds(30, 0) // 30 sec
}
// Customers despawn rate
const CUSTOMER_SHOPING_RATE = {
    MEAN : Time.getSeconds(30), // 30 sec
    STD_DEV : Time.getSeconds(5) // 5 sec
}
// Customers despawn rate
const CUSTOMER_DESPAWN_RATE = {
    MEAN : Time.getSeconds(0, 5), // 5 min
    STD_DEV : Time.getSeconds(0, 1) // 1 min
}

// Wholesale spawn rate
const WHOLESALE_SPAWN_RATE = {
    MEAN : Time.getSeconds(0, 2), // 2 min
    STD_DEV : Time.getSeconds(30, 0) // 30 sec
}
// Wholesale despawn rate
const WHOLESALE_DESPAWN_RATE = {
    MEAN : Time.getSeconds(0, 3), // 3 min
    STD_DEV : Time.getSeconds(30, 0) // 30 sec
}

// Import Game Modules
import {
    Item,
    Player,
    Customer,
    Wholesale,
    Category,
    Theme
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


let theme_list = {};
// List of Categories
let category_list = {};
// List of Items
let item_list = {};

// Read Item List from JSON Data file
let theme_id = 0
let category_id = 0;
let item_id = 0;

for(let item_theme of JSON_ITEMS){
    theme_list[theme_id] = (new Theme(theme_id, item_theme.name));

    for(let item_category of item_theme.category){
        category_list[category_id] = (new Category(category_id, item_category.name));

        for(let item of item_category.items){
            item_list[item_id] = (new Item(item_id, item.name, theme_list[theme_id], category_list[category_id]));
            //category_list[category_id].addItem(item_list[item_id]);
            theme_list[theme_id].addItem(item_list[item_id], category_list[category_id]);

            item_id++;
        }

        category_id++;
    }

    theme_id++;
}

// List of Players
let player_list = {};

// List of Customers
let customer_list = [];


// === FOR DEBUG ONLY ===
// // Generate random shopping rate
// let shopping_timer = Random.normal(CUSTOMER_SHOPING_RATE.MEAN, CUSTOMER_SHOPING_RATE.STD_DEV);
// // Generate random despawn rate
// let despawn_timer = Random.normal(CUSTOMER_DESPAWN_RATE.MEAN, CUSTOMER_DESPAWN_RATE.STD_DEV);
// // Generate new Customer
// let new_customer = new Customer(Random.uniformInt(50, 100), shopping_timer, despawn_timer);

// // Generate random wishlist
// new_customer.generateRandomWishlist(item_list);

// // Add new Customer to Customer List
// customer_list.push(new_customer);
// ======================


// List of Wholesales
let wholesale_list = [];

// Generate 2 initals Wholesales
for(let i = 0; i < 2; i++){
    // Generate deswpan rate
    let despawn_timer = Random.normal(WHOLESALE_DESPAWN_RATE.MEAN / (2 - i), WHOLESALE_DESPAWN_RATE.STD_DEV / (2 - i));
    // Create new Wholesale and push it to Wholesale List
    wholesale_list.push(Wholesale.generateRandomWholesale(i, theme_list, despawn_timer));
}

//============================================================= Player Interactions ========================================================


// New Client connection, set up Player-Server intaractions
io.on("connection", (socket) => {

    //=========================== New Player ==================================

    socket.on("New Player", (pseudo) => {
        // Send back Player ID
        socket.emit("id", socket.id);

        // Create new Player
        let new_player = new Player(socket, pseudo, STARTING_MONEY);
        // Add new player to Player List
        player_list[socket.id] = new_player


        // === FOR DEBUG ONLY ===
        //for(let i in item_list)
            new_player.inventory.addItem(item_list[0], 10, 10);
            new_player.inventory.addItem(item_list[2], 10, 10);
            new_player.inventory.addItem(item_list[4], 10, 10);
            new_player.inventory.addItem(item_list[8], 10, 10);
            new_player.inventory.addItem(item_list[20], 10, 10);

        new_player.update();
        // ======================

        // // Update the LeaderBoard
        // updateLeaderBoard();

        // Update the Customers
        updateCustomers();
        // Update Wholesale
        updateWholesales();
    });

    //=========================== Player Inputs ==================================

    // Update Prices
    socket.on("Player Change Item Price", (item_id, new_price) => {
        // Get Player
        let player = player_list[socket.id];
        // Get Item
        let item = item_list[item_id];

        // Get New Price
        new_price = parseFloat(new_price);

        // Check if New Price is a number
        if(!isNaN(new_price)){
            // Round New Price into an Integer
            new_price = Math.round(new_price);

            // Check that New Price >= 0
            if(new_price < 0)
                new_price = 0;

            // Change Item Price for New Price
            player.changePrice(item, new_price);
        } else {
            // Update Player
            player.update();
        }
    });


    // Player Bid
    socket.on("Player Bid", (wholesale_id, bid) => {
        // Get Player
        let player = player_list[socket.id];
        // Get Wholesale
        let wholesale = wholesale_list.find((x) => {return x.id == wholesale_id});

        // Get Bid
        bid = parseFloat(bid);

        // Check if Bid is a number
        if(!isNaN(bid)){
            // Round Bid into an Integer
            bid = Math.round(bid);

            // Check that Bid >= 0
            if(bid < 0)
                bid = 0;

            // I Wholesale exist : Add Bid
            if(wholesale != undefined)
                wholesale.addBid(player, bid);
        }

        // Update the Player
        player.update();

        // // Update the LeaderBoard
        // updateLeaderBoard();

        // Update the Wholesale List
        updateWholesales();
    });

    //=========================== Player Disconnection ==================================

    socket.on('disconnect', () => {
        // If Player ID exist
        if(player_list[socket.id]){
            // Remove Player from Player List
            delete player_list[socket.id];

            // Remove Player from Wholesales Bids
            // For each Wholesale
            for(let wholesale of wholesale_list){
                // For each Bid
                for(let i in wholesale.bid_list){
                    // If Bid is from Player
                    if(wholesale.bid_list[i].player.getID() == socket.id){
                        // Remove Bid
                        wholesale.bid_list.splice(i, 1);
                    }
                }
            }
        }

        // // Update the LeaderBoard
        // updateLeaderBoard();

        // Update the Wholesale List
        updateWholesales();
    });

});


//============================================================= Server Interactions ========================================================


// Update LeaderBoard
// function updateLeaderBoard(){
//     // Init new LeaderBoard
//     let leader_board = {};

//     // Add every players (Score = Money, TBD)
//     for(let id in player_list){
//         leader_board[id] = {
//             pseudo: player_list[id].pseudo,
//             score: player_list[id].money
//         }
//     }

//     // Broadcast LeaderBoard
//     io.emit("Update LeaderBoard", leader_board);
// }

// Update Customers
function updateCustomers(){
    // Timers need to be removed to awoid Cheating
    // Init an empty array of Sendable Customers
    let customer_list_sendable =  [];
    
    // For each Customer in Customers List
    for(let customer of customer_list){
        // Add the Sendable Clone to the new List
        customer_list_sendable.push(customer.getSendable());
    }

    io.emit("Update Customers", customer_list_sendable);
}

// Update Wholesale
function updateWholesales(){

    // Player Object (in Bid List) contain a Socket and can't be send as-is to the Clients
    // Timers need to be removed to awoid Cheating
    // Init an empty array of Sendable Wholesales
    let wholesale_list_sendable =  [];
    
    // For each Wholesale in Wholesale List
    for(let wholesale of wholesale_list){
        // Add the Sendable Clone to the new List
        wholesale_list_sendable.push(wholesale.getSendable());
    }

    // Update the Wholesales infos
    io.emit("Update Wholesales", wholesale_list_sendable);
}

function updateWholesalesTimers(){
    let wholesale_list_sendable =  [];
    
    // For each Wholesale in Wholesale List
    for(let wholesale of wholesale_list){
        // Add the Sendable Clone to the new List
        wholesale_list_sendable.push(wholesale.getSendable());
    }

    io.emit("Update Wholesales Timers", wholesale_list_sendable);
}


//============================================================= Main Loop ========================================================

// Init First Spawn Cooldowns
let customer_spawn_cooldown = Random.normal(CUSTOMER_SPAWN_RATE.MEAN, CUSTOMER_SPAWN_RATE.STD_DEV);
let wholesale_spawn_cooldown = Random.normal(WHOLESALE_SPAWN_RATE.MEAN, WHOLESALE_SPAWN_RATE.STD_DEV);

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
        new_customer.generateRandomWishlist(item_list);

        // Add new Customer to Customer List
        customer_list.push(new_customer);

        // Update Customers
        updateCustomers();
        // Server Log
        console.log("Customer - NEW");

        // Reset Cooldown
        customer_spawn_cooldown = Random.normal(CUSTOMER_SPAWN_RATE.MEAN, CUSTOMER_SPAWN_RATE.STD_DEV);
    } else {
        // Decrement Spawn Timer
        customer_spawn_cooldown--;
    }

    // Handle Customer Actions (Shopping and Despawn)
    // For each Customer
    for(let i in customer_list){

        // Shopping
        // If Shopping Timer has ended
        if(customer_list[i].shopping_timer <= 0){
            // Customer Shop
            customer_list[i].shop(player_list);

            // Update Customers
            updateCustomers();
            // Server Log
            console.log("Customer - SHOPPING");

            // Reset Shoping Timer
            customer_list[i].shopping_timer = Random.normal(CUSTOMER_SHOPING_RATE.MEAN, CUSTOMER_SHOPING_RATE.STD_DEV);
        } else {
            // Decrement Shoping Timer
            customer_list[i].shopping_timer--;
        }


        // Despawn
        // If Despawn Timer has ended OR no more Items in Wishlist
        if(customer_list[i].despawn_timer <= 0 || Object.keys(customer_list[i].wishlist).length == 0){
            // Remove Customer from List
            customer_list.splice(i, 1);

            // Update Customers
            updateCustomers();
            // Server Log
            console.log("Customer - LEAVE");
        } else {
            // Decrement Despawn Timer
            customer_list[i].despawn_timer--;
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
        wholesale_list.push(Wholesale.generateRandomWholesale(id, theme_list, despawn_timer));

        // Update the Wholesale List
        updateWholesales();
        // Server Log
        console.log("Wholesale - NEW");

        // Reset Cooldown
        wholesale_spawn_cooldown = Random.normal(WHOLESALE_SPAWN_RATE.MEAN, WHOLESALE_SPAWN_RATE.STD_DEV);
    } else {
        // Decrement Spawn Timer
        wholesale_spawn_cooldown--;
    }

    // Despawn ended Wholesales
    // For each Wholesale
    for(let i in wholesale_list){
        // If Despawn Timer has ended
        if(wholesale_list[i].despawn_timer <= 0){
            // End the Bidding
            wholesale_list[i].endBid();

            // Remove the Wholesale
            wholesale_list.splice(i, 1);

            // Update all players
            for(let i in player_list){
                player_list[i].update();
            }
            
            // Update the Wholesale List
            updateWholesales();
            // Server Log
            console.log("Wholesale - END");
        } else {
            // Decrement the Despawn Timer
            wholesale_list[i].despawn_timer--;
        }
    }

    //=============================================================

    // // Update Leader Board
    // updateLeaderBoard();

    // Update timers
    updateWholesalesTimers();
}, 1000);