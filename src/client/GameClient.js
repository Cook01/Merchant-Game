// Dependencies
import { Random } from "../utils/Random.js";
import { Time } from "../utils/Time.js";

let socket = io()

// For test purpose
socket.on("debug", (data) => {
    console.log(data);
});


//============================================================= Player Pseudo ========================================================

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
  
    return Random.choose(adjs) + "_" + Random.choose(nouns);
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

// Player Change Prices
function changePrice(itemId, newPrice){
    socket.emit("Player Change Item Price", itemId, newPrice);
}

// Player Place Bid
function bid(wholesaleID){
    let bid = document.getElementById("bid_" + wholesaleID).value;
    socket.emit("Player Bid", wholesaleID, bid);
}


// Display Transactions Failures
socket.on("Failure", (failureMsg) => {
    alert(failureMsg);
});

// Server Down
socket.on("disconnect", () =>{
    document.body.innerHTML = "<h1>Connection lost</h1> <div>Please try to reload the page later</div>";
    socket.disconnect();
});


//============================================================= Server Updates ========================================================

// Ping Player Item
socket.on("Ping Player Item", (item) => {
    let inventory_item_row = document.getElementById("item_" + item.id);
    let original_color = inventory_item_row.style.backgroundColor;


    inventory_item_row.style.transition = "none";
    inventory_item_row.style.backgroundColor = "yellow";

    setTimeout(() => {
        inventory_item_row.style.transition = "background-color linear 1s";
        inventory_item_row.style.backgroundColor = original_color;

    }, 1000);
});

// Update Player Infos
socket.on("Update Player", (player) => {
    let pseudo_ui = document.getElementById("pseudo_ui");
    pseudo_ui.textContent = player.pseudo;

    // Get Money Display UI
    let money_ui = document.getElementById("money_ui");
    // Update Value
    money_ui.textContent = player.money;

    // Get the current Inventory UI Element
    let old_inventory_ui = document.getElementById("inventory_ui");
    // Create the new UI Element
    let new_inventory_ui = document.createElement('tbody');
    new_inventory_ui.id = "inventory_ui";

    // For each Inventory Slot in Inventory
    for(let item_id in player.inventory.slotList){
        // Get the Item
        let slot = player.inventory.slotList[item_id];

        // Create a new row
        let inventory_item_row = new_inventory_ui.insertRow();
        inventory_item_row.id = "item_" + item_id;

        // Create the cells
        let item_name_cell = inventory_item_row.insertCell();
        let item_quantity_cell = inventory_item_row.insertCell();
        let item_price_cell = inventory_item_row.insertCell();

        // Print the Item infos
        item_name_cell.textContent = slot.item.name;
        item_quantity_cell.textContent = slot.quantity;

        let item_price_input = document.createElement("input");
        item_price_input.setAttribute("type", "number");
        item_price_input.setAttribute("min", "0");
        item_price_input.setAttribute("value", slot.price);
        item_price_input.onchange = (() => {
            changePrice(item_id, item_price_input.value);
        });

        item_price_cell.appendChild(item_price_input);
    }

    // Switch the old UI with the new one
    old_inventory_ui.parentNode.replaceChild(new_inventory_ui, old_inventory_ui);
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
            let timer_ui = document.getElementById("timer_" + wholesale.id);
            let item_list_table = document.getElementById("item_list_" + wholesale.id);
            let bid_list_table = document.getElementById("bid_list_" + wholesale.id);

            //=============================================================

            // Update Timer
            timer_ui.innerText = Time.displayTime(wholesale.despawn_timer);

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

                if(bid.player.id === myId){
                    bid_list_table.rows[row_index].style.color = "blue";
                    bid_list_table.rows[row_index].style.fontWeight = "bold";
                } else {
                    bid_list_table.rows[row_index].removeAttribute("style");
                }

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
            let timer_ui = document.createElement("div");
            // Set DIV id
            timer_ui.id = "timer_" + wholesale.id;
            // Set DIV class
            timer_ui.classList.add("wholesale_timer");

            // Update Timer
            timer_ui.innerText = Time.displayTime(wholesale.despawn_timer);

            // Add Timer to Wholesale UI
            wholesale_ui.appendChild(timer_ui);

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
            let item_name_header_cell = document.createElement("th");
            item_name_header_cell.textContent = "Item Name";
            let item_quantity_header_cell = document.createElement("th");
            item_quantity_header_cell.textContent = "Quantity";

            // Add the two Header Cells to Header Row
            item_list_table_head_row.appendChild(item_name_header_cell);
            item_list_table_head_row.appendChild(item_quantity_header_cell);

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
            let player_name_header_cell = document.createElement("th");
            player_name_header_cell.textContent = "Player";
            let player_bid_header_cell = document.createElement("th");
            player_bid_header_cell.textContent = "Bid";

            // Add the two Header Cells to Header Row
            bid_list_table_head_row.appendChild(player_name_header_cell);
            bid_list_table_head_row.appendChild(player_bid_header_cell);

            // Add Table Header to Bid List Table
            bid_list_table.appendChild(bid_list_table_head);

            // Create Table Body
            let bid_list_table_body = document.createElement("tbody");

            // For each Bids
            for(let bid of wholesale.bidList){
                // Create a Row
                let bid_list_table_body_row = bid_list_table_body.insertRow();

                if(bid.player.id == myId){
                    bid_list_table_body_row.style.color = "blue";
                    bid_list_table_body_row.style.fontWeight = "bold";
                } else {
                    bid_list_table_body_row.removeAttribute("style");
                }

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
            // Add an Event Listener for KeyPress
            bid_input_field.addEventListener("keypress", (event) => {
                // If Key pressed is "Enter"
                if(event.key === "Enter"){
                    // Cancel the default action, if needed
                    event.preventDefault();
                    // Add Bid for Wholesale
                    bid(wholesale.id);
                }
            });

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