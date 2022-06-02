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
function haiku(){
    var adjs = ["autumn", "hidden", "bitter", "misty", "silent", "empty", "dry",
    "dark", "summer", "icy", "delicate", "quiet", "white", "cool", "spring",
    "winter", "patient", "twilight", "dawn", "crimson", "wispy", "weathered",
    "blue", "billowing", "broken", "cold", "damp", "falling", "frosty", "green",
    "long", "late", "lingering", "bold", "little", "morning", "muddy", "old",
    "red", "rough", "still", "small", "sparkling", "throbbing", "shy",
    "wandering", "withered", "wild", "black", "young", "holy", "solitary",
    "fragrant", "aged", "snowy", "proud", "floral", "restless", "divine",
    "polished", "ancient", "purple", "lively", "nameless"]
  
    , nouns = ["waterfall", "river", "breeze", "moon", "rain", "wind", "sea",
    "morning", "snow", "lake", "sunset", "pine", "shadow", "leaf", "dawn",
    "glitter", "forest", "hill", "cloud", "meadow", "sun", "glade", "bird",
    "brook", "butterfly", "bush", "dew", "dust", "field", "fire", "flower",
    "firefly", "feather", "grass", "haze", "mountain", "night", "pond",
    "darkness", "snowflake", "silence", "sound", "sky", "shape", "surf",
    "thunder", "violet", "water", "wildflower", "wave", "water", "resonance",
    "sun", "wood", "dream", "cherry", "tree", "fog", "frost", "voice", "paper",
    "frog", "smoke", "star"];
  
    return adjs[Math.floor(Math.random() * (adjs.length - 1))] + "_" + nouns[Math.floor(Math.random() * (nouns.length - 1))];
}
let pseudo = prompt("Choose a nickname", haiku());

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
    let quantity = document.getElementById("buy_" + itemId).value;
    socket.emit("Buy", itemId, quantity);
}
// Sell
function sell(itemId){
    let quantity = document.getElementById("sell_" + itemId).value;
    socket.emit("Sell", itemId, quantity);
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

    // Switch the old UI with the new one
    oldMarketUi.parentNode.replaceChild(newMarketUi, oldMarketUi);
});

//=============================================================

// Update the Customers
socket.on("Update Customers", (customerList) => {
    // Get the current Customers UI Element
    let oldCustomersUi = document.getElementById("customers_ui");
    // Create the new Customers UI Element
    let newCustomersUi = document.createElement("div");
    newCustomersUi.id = "customers_ui";

    // For each Customer in Customer List
    for(let customer of customerList){
        // New table
        let customerTableHTML = "<table>";
        // Set caption
        customerTableHTML += "<caption>Budget : <span style='font-weight: bold'>" + customer.money + "</span></caption>";

        // Set the Header
        customerTableHTML += "<thead></tr><tr><th>Item Name</th><th>Quantity</th></tr></thead>";
        // New tBody
        customerTableHTML += "<tbody>"
        // Foreach item in wishlist
        for(let elementId in customer.wishlist){
            const whishlistElement = customer.wishlist[elementId];

            // Create a new row
            customerTableHTML += "<tr>";

            // Create the cells
            customerTableHTML += "<td>" + whishlistElement.item.name + "</td>";
            customerTableHTML += "<td>" + whishlistElement.quantity + "</td>";

            // Close the row
            customerTableHTML += "</tr>";
        }
        // Close the tBody
        customerTableHTML += "</tbody>";
        // Close the Table
        customerTableHTML += "</table>";

        newCustomersUi.innerHTML += customerTableHTML;
    }

    // Switch the old UI with the new one
    oldCustomersUi.parentNode.replaceChild(newCustomersUi, oldCustomersUi);
});