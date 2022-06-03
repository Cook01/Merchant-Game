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

// Player Change Prices
function bid(wholesaleID){
    let bid = document.getElementById("bid_" + wholesaleID).value;
    socket.emit("Player Bid", wholesaleID, bid);
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
// socket.on("Update LeaderBoard", (leaderBoard) => {

//     // Get the current Score UI Element
//     let oldScoreUi = document.getElementById("score_ui");

//     // Create the new UI Element
//     let newScoreUi = document.createElement('tbody');
//     newScoreUi.id = "score_ui";

//     // For each entry of LeaderBoard
//     for(let id in leaderBoard){
//         // Get Player
//         let player = leaderBoard[id];

//         // Create a new row
//         let playerRow = newScoreUi.insertRow();

//         // Create the cells
//         let playerPseudoCell = playerRow.insertCell();
//         let playerScoreCell = playerRow.insertCell();

//         // Print the player infos
//         playerPseudoCell.textContent = player.pseudo;
//         playerScoreCell.textContent = player.score;

//         // If the row is for current player
//         if(id == myId)
//             // Set CSS Style to bold blue in the Players tab
//             playerRow.setAttribute("style", "color:blue; font-weight: bold;");
//     }

//     // Switch the old UI with the new one
//     oldScoreUi.parentNode.replaceChild(newScoreUi, oldScoreUi);
// });

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
        customerTableHTML += "<thead><tr><th>Item Name</th><th>Quantity</th></tr></thead>";
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

//=============================================================

socket.on("Update Wholesales", (wholesales_list) => {
    // Get Wholesales List Container
    let wholesales_container = document.getElementById("wholesales_ui");

    // For each Wholesale in list
    for(let wholesale of wholesales_list){
        // Get associated Wholesale UI
        let wholesale_ui = document.getElementById("wholesale_" + wholesale.id);

        // 1 - If Wholesale UI exist : Update it
        if(wholesale_ui != null){
            //Get UI elements
            let timer = document.getElementById("timer_" + wholesale.id);
            let item_list_table = document.getElementById("item_list_" + wholesale.id);
            let bid_list_table = document.getElementById("bid_list_" + wholesale.id);

            //=============================================================

            // Update Timer
            let timer_minutes = Math.floor(wholesale.timer / 60).toString().padStart(2, "0");
            let timer_seconds = (wholesale.timer % 60).toString().padStart(2, "0");
            timer.innerText = timer_minutes + ":" + timer_seconds;

            //=============================================================

            // Update Item List
            // Loop until nuber of rows == number of items
            while(item_list_table.rows.length - 1 != 1){

                // If more rows in Table than Items in Wholesale
                if(item_list_table.rows.length - 1 > 1){
                    // Remove Rows
                    item_list_table.deleteRow(-1);

                // If less rows in Table than Items in Wholesale
                } else if(item_list_table.rows.length - 1 < 1){
                    // Get Table Body
                    let table_body = item_list_table.getElementsByTagName("tbody")[0];
                    // Add Rows
                    let new_row = table_body.insertRow();

                    // Add 2 Cells (Item | Quantity) in the new Row
                    new_row.insertCell();
                    new_row.insertCell();
                }
            }

            // Update Item Infos
            item_list_table.rows[1].cells[0].textContent = wholesale.item.name;
            item_list_table.rows[1].cells[1].textContent = wholesale.quantity;

            //=============================================================

            // Update Bids List
            // Loop until nuber of rows == number of bids
            while(bid_list_table.rows.length - 1 != wholesale.bidList.length){

                // If more rows in Table than bids in Bid List
                if(bid_list_table.rows.length - 1 > wholesale.bidList.length){
                    // Remove Rows
                    bid_list_table.deleteRow(-1);

                // If less rows in Table than Items in Wholesale
                } else if(bid_list_table.rows.length - 1 < wholesale.bidList.length){
                    // Get Table Body
                    let table_body = bid_list_table.getElementsByTagName("tbody")[0];
                    // Add Rows
                    let new_row = table_body.insertRow();
                    // Add 2 Cells (Player | Bid) in the new Row
                    new_row.insertCell();
                    new_row.insertCell();
                }
            }

            // Sort Bid List so best Bid is first
            wholesale.bidList.sort((a, b) => (a.money < b. money) ? 1 : -1);

            let row_index = 0;

            // Update Bids Infos
            for(let bid of wholesale.bidList){
                row_index++;

                bid_list_table.rows[row_index].cells[0].textContent = bid.player.pseudo;
                bid_list_table.rows[row_index].cells[1].textContent = bid.money;
            }

        // 2 - If Wholesale UI doesn't exist : Create it
        } else {
            // Create Wholesale UI
            let wholesale_ui = document.createElement("div");
            // Set DIV id
            wholesale_ui.id = "wholesale_" + wholesale.id;
            // Set DIV class
            wholesale_ui.classList.add("wholesale");

            //=============================================================

            // Create Timer
            let timer = document.createElement("div");
            // Set DIV id
            timer.id = "timer_" + wholesale.id;
            // Set DIV class
            timer.classList.add("wholesale_timer");

            // Update Timer
            let timer_minutes = Math.floor(wholesale.timer / 60).toString().padStart(2, "0");
            let timer_seconds = (wholesale.timer % 60).toString().padStart(2, "0");
            timer.innerText = timer_minutes + ":" + timer_seconds;

            // Add Timer to Wholesale UI
            wholesale_ui.appendChild(timer);

            //=============================================================

            // Create Item List Table
            let item_list_table = document.createElement("table");
            // Set Table id
            item_list_table.id = "item_list_" + wholesale.id;
            // Set Table class
            item_list_table.classList.add("item_list");

            // Create Table Header
            let item_list_table_head = document.createElement("thead");
            // Create Header Row
            let item_list_table_head_row = item_list_table_head.insertRow();
            // Add two Header Cells ("Item Name" | "Quantity")
            item_list_table_head_row.insertCell().textContent = "Item Name";
            item_list_table_head_row.insertCell().textContent = "Quantity";

            // Add Table Header to Item List Table
            item_list_table.appendChild(item_list_table_head);

            // Create Table Body
            let item_list_table_body = document.createElement("tbody");
            // Create a Row
            let item_list_table_body_row = item_list_table_body.insertRow();
            // Add two Cells (Item Name | Quantity)
            item_list_table_body_row.insertCell().textContent = wholesale.item.name;
            item_list_table_body_row.insertCell().textContent = wholesale.quantity;

            // Add Table Body to Item List Table
            item_list_table.appendChild(item_list_table_body);

            // Add Item List Table to Wholesale UI
            wholesale_ui.appendChild(item_list_table);

            //=============================================================

            // Create Bid List Table
            let bid_list_table = document.createElement("table");
            // Set Table id
            bid_list_table.id = "bid_list_" + wholesale.id;
            // Set Table class
            bid_list_table.classList.add("bid_list");

            // Create Table Header
            let bid_list_table_head = document.createElement("thead");
            // Create Header Row
            let bid_list_table_head_row = bid_list_table_head.insertRow();
            // Add two Header Cells ("Player" | "Bid")
            bid_list_table_head_row.insertCell().textContent = "Player";
            bid_list_table_head_row.insertCell().textContent = "Bid";

            // Add Table Header to Bid List Table
            bid_list_table.appendChild(bid_list_table_head);

            // Create Table Body
            let bid_list_table_body = document.createElement("tbody");

            // For each Bids
            for(let bid of wholesale.bidList){
                // Create a Row
                let bid_list_table_body_row = bid_list_table_body.insertRow();
                // Add two Cells (Player | Bid)
                bid_list_table_body_row.insertCell().textContent = bid.player.pseudo;
                bid_list_table_body_row.insertCell().textContent = bid.money;
            }

            // Add Table Body to Bid List Table
            bid_list_table.appendChild(bid_list_table_body);

            // Add Bid List Table to Wholesale UI
            wholesale_ui.appendChild(bid_list_table);

            //=============================================================

            // Create Bid Input Div
            let bid_input_ui = document.createElement("div");
            // Set Div class
            bid_input_ui.classList.add("wholesale_bid_input");

            // Create Bid Input Field
            let bid_input_field = document.createElement("input");
            // Set "type" attribute to "number"
            bid_input_field.setAttribute("type", "number");
            // Set "min" attribute to "0"
            bid_input_field.setAttribute("min", "0");
            // Set "value" attribute to "0"
            bid_input_field.setAttribute("value", "0");
            // Set Bid Input Field id
            bid_input_field.id = "bid_" + wholesale.id;

            // Add Bid Input Field to Bid Input Div
            bid_input_ui.appendChild(bid_input_field);

            // Create Bid Button
            let bid_input_button = document.createElement("button");
            // Set OnClick to "bid(id)"
            bid_input_button.onclick = (() => {bid(wholesale.id);});
            // Set Button text to "Bid"
            bid_input_button.textContent = "Bid";

            // Add button to Bid Input Div
            bid_input_ui.appendChild(bid_input_button);

            // Add Bid Input Div to Wholesale UI
            wholesale_ui.appendChild(bid_input_ui);

            //=============================================================

            // Add Wholesale UI to Wholesales List Container
            wholesales_container.appendChild(wholesale_ui);
        }
    }

    // 3 - If Wholesale UI doesn't have matching Wholesale : Remove it
    for(let wholesale_ui of wholesales_container.childNodes){
        let ui_id = parseInt(wholesale_ui.id.replace("wholesale_", ""));

        let wholesale_found = false;
        for(let wholesale of wholesales_list){
            if(wholesale.id == ui_id)
                wholesale_found = true;
        }

        if(!wholesale_found)
            wholesale_ui.remove();
    }
});