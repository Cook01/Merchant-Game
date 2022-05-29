// Dependencies
let socket = io()

// For test purpose
socket.on("debug", (data) => {
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
socket.on("id", (id) => {
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

// Player Change Prices
function changePrice(itemId, priceOffset){
    socket.emit("Player Change Item Price", itemId, priceOffset);
}


// Display Transactions Failures
socket.on("Failure", (failureMsg) => {
    alert(failureMsg);
});


//============================================================= Server Updates ========================================================


// Update Player Infos
socket.on("Update Player", (player) => {
    // Get Money Display UI
    let moneyUi = document.getElementById("money_ui");
    // Update Value
    moneyUi.textContent = player.money;

    // Get the current Inventory UI Element
    let oldInventoryUi = document.getElementById("inventory_ui");
    // Create the new UI Element
    let newInventoryUi = document.createElement('tbody');
    newInventoryUi.id = "inventory_ui";

    // For each Inventory Slot in Inventory
    for(let itemId in player.inventory.slotList){
        // Get the Item
        let slot = player.inventory.slotList[itemId];

        // Create a new row
        let inventoryItemRow = newInventoryUi.insertRow();

        // Create the cells
        let itemNameCell = inventoryItemRow.insertCell();
        let itemQuantityCell = inventoryItemRow.insertCell();
        let itemPriceCell = inventoryItemRow.insertCell();

        // Print the Item infos
        itemNameCell.textContent = slot.item.name;
        itemQuantityCell.textContent = slot.quantity;

        itemPriceCell.innerHTML = slot.price + " <button onclick='changePrice(" + itemId + ", " + 1 + ")'>+</button><button onclick='changePrice(" + itemId + ", " + -1 + ")'>-</button>";
    }

    // Switch the old UI with the new one
    oldInventoryUi.parentNode.replaceChild(newInventoryUi, oldInventoryUi);
});

//=============================================================

// Update LeaderBoard
socket.on("Update LeaderBoard", (leaderBoard) => {

    // Get the current Score UI Element
    let oldScoreUi = document.getElementById("score_ui");

    // Create the new UI Element
    let newScoreUi = document.createElement('tbody');
    newScoreUi.id = "score_ui";

    // For each entry of LeaderBoard
    for(let id in leaderBoard){
        // Get Player
        let player = leaderBoard[id];

        // Create a new row
        let playerRow = newScoreUi.insertRow();

        // Create the cells
        let playerPseudoCell = playerRow.insertCell();
        let playerScoreCell = playerRow.insertCell();

        // Print the player infos
        playerPseudoCell.textContent = player.pseudo;
        playerScoreCell.textContent = player.score;

        // If the row is for current player
        if(id == myId)
            // Set CSS Style to bold blue in the Players tab
            playerRow.setAttribute("style", "color:blue; font-weight: bold;");
    }

    // Switch the old UI with the new one
    oldScoreUi.parentNode.replaceChild(newScoreUi, oldScoreUi);
});

//=============================================================

// Update the Market
socket.on("Update Market", (market) => {
    // Get the current Market UI Element
    let oldMarketUi = document.getElementById("market_ui");
    // Create the new Market UI Element
    let newMarketUi = document.createElement('tbody');
    newMarketUi.id = "market_ui";

    // For each Item in the Market
    for(let itemId in market.slotList){
        // Get the Inventory Slot
        let slot = market.slotList[itemId];

        // Create a new row
        let inventoryItemRow = newMarketUi.insertRow();

        // Create the cells
        let itemNameCell = inventoryItemRow.insertCell();
        let itemQuantityCell = inventoryItemRow.insertCell();
        let itemPriceCell = inventoryItemRow.insertCell();
        let itemBuyCell = inventoryItemRow.insertCell();
        let itemSellCell = inventoryItemRow.insertCell();

        // Print the Market infos
        itemNameCell.textContent = slot.item.name;
        itemQuantityCell.textContent = slot.quantity;
        itemPriceCell.textContent = slot.price;

        itemBuyCell.innerHTML = "<input type='number', min='0', id='buy_" + itemId + "', value=0><button onclick='buy(" + itemId + ")'>Buy</button>";
        itemSellCell.innerHTML = "<input type='number', min='0', id='sell_" + itemId +"', value=0><button onclick='sell(" + itemId + ")'>Sell</button>";
    }

    //switch the old UI with the new one
    oldMarketUi.parentNode.replaceChild(newMarketUi, oldMarketUi);
});