//Dependencies
let socket = io()

//For test purpose
socket.on("debug", function(data){
    console.log(data);
});


//============================================================= Player Pseudo ========================================================

// Generate a Random default Pseudo
let random = Math.round(Math.random() * (99 - 1) + 1);
// Change Pseudo
let pseudo = prompt("Choose a nickname", "dickHead" + random);
// Init Player ID
let myId = -1;


//============================================================= Register New Player to Server ========================================================


// Send New Player notification to the server
socket.emit("New Player", pseudo);

// Get Player ID
socket.on("id", function(id){
    myId = id;
});


//============================================================= User Inputs ========================================================


// Buy
function buy(itemId){
    let quantity = document.getElementById("buy_" + itemId);
    socket.emit("Buy", itemId, quantity.value);
}
// Sell
function sell(itemId){
    let quantity = document.getElementById("sell_" + itemId);
    socket.emit("Sell", itemId, quantity.value);
}

// Update Prices
function changePrice(itemId, priceOffset){
    socket.emit("Player Change Item Price", itemId, priceOffset);
}


// Display Transactions Failures
socket.on("Failure", function(failureMsg){
    alert(failureMsg);
});


//============================================================= Server Inputs ========================================================