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
let my_id = -1;


//============================================================= Register New Player to Server ========================================================


// Send New Player notification to the server
socket.emit("New Player", pseudo);

// Get Player ID
socket.on("id", (id) => {
    my_id = id;
});


//============================================================= User Inputs ========================================================

// Player Change Prices
function changePrice(item_id, new_price){
    socket.emit("Player Change Item Price", item_id, new_price);
}

// Player Place Bid
function bid(wholesale_id){
    let bid = document.getElementById("bid_" + wholesale_id).value;
    socket.emit("Player Bid", wholesale_id, bid);
}


// Display Transactions Failures
socket.on("Failure", (failure_message) => {
    alert(failure_message);
});

// Server Down
socket.on("disconnect", () =>{
    document.body.innerHTML = "<h1>Connection lost</h1> <div>Please try to reload the page later</div>";
    socket.disconnect();
});


//============================================================= Server Updates ========================================================

// Ping Player Item
// TODO
// socket.on("Ping Player Item", (item) => {
//     let inventory_item_row = document.getElementById("item_" + item.id);
//     let original_color = inventory_item_row.style.backgroundColor;


//     inventory_item_row.style.transition = "none";
//     inventory_item_row.style.backgroundColor = "yellow";

//     setTimeout(() => {
//         inventory_item_row.style.transition = "background-color linear 1s";
//         inventory_item_row.style.backgroundColor = original_color;

//     }, 1000);
// });

// Update Player Infos
socket.on("Update Player", (player) => {
    // Get the Player Pseudo UI
    let pseudo_ui = document.getElementById("pseudo_ui");
    // Update the Pseudo
    pseudo_ui.textContent = player.pseudo;

    // Get Money Display UI
    let money_ui = document.getElementById("money_ui");
    // Update Value
    money_ui.textContent = player.money;

    // Get the current Inventory UI Element
    let old_inventory_ui = document.getElementById("inventory_ui");
    // Create the new UI Element
    let new_inventory_ui = document.createElement('tbody');
    // Set the Inventory UI ID
    new_inventory_ui.id = "inventory_ui";

    // For each Inventory Slot in Inventory
    for(let item_id in player.inventory.slot_list){
        // Get the Item
        let slot = player.inventory.slot_list[item_id];

        // Create a new row
        let inventory_item_row = new_inventory_ui.insertRow();
        // Set the Inventory row ID
        inventory_item_row.id = "item_" + item_id;

        // Create the cells
        let item_name_cell = inventory_item_row.insertCell();
        let item_quantity_cell = inventory_item_row.insertCell();
        let item_price_cell = inventory_item_row.insertCell();

        // Print the Item infos
        item_name_cell.textContent = slot.item.name;
        item_quantity_cell.textContent = slot.quantity;

        // Create the Price Input Field
        let item_price_input = document.createElement("input");
        item_price_input.setAttribute("type", "number");
        item_price_input.setAttribute("min", "0");
        item_price_input.setAttribute("value", slot.price);
        // Set OnChange() Listener
        item_price_input.onchange = (() => {
            // Change the Price
            changePrice(item_id, item_price_input.value);
        });

        // Add the Price Input Field to the Cell
        item_price_cell.appendChild(item_price_input);
    }

    // Switch the old UI with the new one
    old_inventory_ui.parentNode.replaceChild(new_inventory_ui, old_inventory_ui);
});

//=============================================================

// Update LeaderBoard
// socket.on("Update LeaderBoard", (leader_board) => {

//     // Get the current Score UI Element
//     let old_score_ui = document.getElementById("score_ui");

//     // Create the new UI Element
//     let new_score_ui = document.createElement('tbody');
//     new_score_ui.id = "score_ui";

//     // For each entry of LeaderBoard
//     for(let id in leader_board){
//         // Get Player
//         let player = leader_board[id];

//         // Create a new row
//         let player_row = new_score_ui.insertRow();

//         // Create the cells
//         let player_pseudo_cell = player_row.insertCell();
//         let player_score_cell = player_row.insertCell();

//         // Print the player infos
//         player_pseudo_cell.textContent = player.pseudo;
//         player_score_cell.textContent = player.score;

//         // If the row is for current player
//         if(id == my_id)
//             // Set CSS Style to bold blue in the Players tab
//             player_row.setAttribute("style", "color:blue; font-weight: bold;");
//     }

//     // Switch the old UI with the new one
//     old_score_ui.parentNode.replaceChild(new_score_ui, old_score_ui);
// });

//=============================================================

// Update the Customers
socket.on("Update Customers", (customer_list) => {
    // Get the current Customers UI Element
    let old_customers_ui = document.getElementById("customers_ui");
    // Create the new Customers UI Element
    let new_customers_ui = document.createElement("div");
    new_customers_ui.id = "customers_ui";

    // For each Customer in Customer List
    for(let customer of customer_list){
        // New table
        let customer_table = document.createElement("table");
        // Set caption
        let customer_budget_caption = customer_table.createCaption();
        customer_budget_caption.textContent = "Budget : ";

        let customer_money_ui = document.createElement("span");
        customer_money_ui.style.fontWeight = "bold";
        customer_money_ui.style.color = "#ffd600";
        customer_money_ui.textContent = customer.money;

        customer_budget_caption.appendChild(customer_money_ui)

        // Set the Header
        let customer_table_header = customer_table.createTHead();
        let customer_table_header_row = customer_table_header.insertRow();

        let customer_table_header_item_name_cell = document.createElement("th");
        let customer_table_header_quantity_cell = document.createElement("th");

        customer_table_header_item_name_cell.textContent = "Item Name";
        customer_table_header_quantity_cell.textContent = "Quantity";

        customer_table_header_row.appendChild(customer_table_header_item_name_cell);
        customer_table_header_row.appendChild(customer_table_header_quantity_cell);

        // New tBody
        let customer_table_body = customer_table.createTBody();

        // Foreach item in wishlist
        for(let element_id in customer.wishlist){
            const whishlist_element = customer.wishlist[element_id];

            // Create a new row
            let customer_table_row = customer_table_body.insertRow();

            // Create the cells
            let customer_table_item_name_cell = customer_table_row.insertCell();
            let customer_table_quantity_cell = customer_table_row.insertCell();

            customer_table_item_name_cell.textContent = whishlist_element.item.name;
            customer_table_quantity_cell.textContent = whishlist_element.quantity;
        }

        new_customers_ui.appendChild(customer_table);
    }

    // Switch the old UI with the new one
    old_customers_ui.parentNode.replaceChild(new_customers_ui, old_customers_ui);
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
            let category_list_table = document.getElementById("category_list_" + wholesale.id);
            let bid_list_table = document.getElementById("bid_list_" + wholesale.id);

            //=============================================================

            // Update Item List
            let category_list_size = Object.keys(wholesale.category_list).length;
            // Loop until nuber of rows == number of items
            while(category_list_table.rows.length - 1 != category_list_size){

                // If more rows in Table than Items in Wholesale
                if(category_list_table.rows.length - 1 > category_list_size){
                    // Remove Rows
                    category_list_table.deleteRow(-1);

                // If less rows in Table than Items in Wholesale
                } else if(category_list_table.rows.length - 1 < category_list_size){
                    // Get Table Body
                    let table_body = category_list_table.getElementsByTagName("tbody")[0];
                    // Add Rows
                    let new_row = table_body.insertRow();

                    // Add 2 Cells (Item | Quantity) in the new Row
                    new_row.insertCell();
                    new_row.insertCell();
                }
            }

            // Update Item Infos
            let j = 1;
            for(let i in wholesale.category_list){
                category_list_table.rows[j].cells[0].textContent = wholesale.category_list[i].category.name;
                category_list_table.rows[j].cells[1].textContent = wholesale.category_list[i].quantity;

                j++;
            }

            //=============================================================

            // Update Bids List
            // Loop until nuber of rows == number of bids
            while(bid_list_table.rows.length - 1 != wholesale.bid_list.length){

                // If more rows in Table than bids in Bid List
                if(bid_list_table.rows.length - 1 > wholesale.bid_list.length){
                    // Remove Rows
                    bid_list_table.deleteRow(-1);

                // If less rows in Table than Items in Wholesale
                } else if(bid_list_table.rows.length - 1 < wholesale.bid_list.length){
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
            wholesale.bid_list.sort((a, b) => (a.money < b. money) ? 1 : -1);

            let row_index = 0;

            // Update Bids Infos
            for(let bid of wholesale.bid_list){
                row_index++;

                if(bid.player.id === my_id){
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

            // Create Theme Title
            let wholesale_theme_ui = document.createElement("div");
            // Set class
            wholesale_theme_ui.classList.add("wholesale_theme");
            // Set text
            wholesale_theme_ui.textContent = wholesale.theme.name;

            // Add Theme Title to Wholesale UI
            wholesale_ui.appendChild(wholesale_theme_ui);

            //=============================================================

            // Create Item List Table
            let category_list_table = document.createElement("table");
            // Set Table id
            category_list_table.id = "category_list_" + wholesale.id;
            // Set Table class
            category_list_table.classList.add("category_list");

            // Create Table Header
            let category_list_table_head = document.createElement("thead");
            // Create Header Row
            let category_list_table_head_row = category_list_table_head.insertRow();
            // Add two Header Cells ("Item Name" | "Quantity")
            let item_name_header_cell = document.createElement("th");
            item_name_header_cell.textContent = "Item Name";
            let item_quantity_header_cell = document.createElement("th");
            item_quantity_header_cell.textContent = "Quantity";

            // Add the two Header Cells to Header Row
            category_list_table_head_row.appendChild(item_name_header_cell);
            category_list_table_head_row.appendChild(item_quantity_header_cell);

            // Add Table Header to Item List Table
            category_list_table.appendChild(category_list_table_head);

            // Create Table Body
            let category_list_table_body = document.createElement("tbody");


            for(let i in wholesale.category_list){
                // Create a Row
                let category_list_table_body_row = category_list_table_body.insertRow();
                // Add two Cells (Item Name | Quantity)
                category_list_table_body_row.insertCell().textContent = wholesale.category_list[i].category.name;
                category_list_table_body_row.insertCell().textContent = wholesale.category_list[i].quantity;
            }

            // Add Table Body to Item List Table
            category_list_table.appendChild(category_list_table_body);

            // Add Item List Table to Wholesale UI
            wholesale_ui.appendChild(category_list_table);

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
            for(let bid of wholesale.bid_list){
                // Create a Row
                let bid_list_table_body_row = bid_list_table_body.insertRow();

                if(bid.player.id == my_id){
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
    // For each Wholesale in the Wholesales List Container
    for(let wholesale_ui of wholesales_container.childNodes){
        // Get the ID from the UI
        let ui_id = parseInt(wholesale_ui.id.replace("wholesale_", ""));
        
        // Matching Wholesale has not been found yet
        let wholesale_found = false;
        // For each Wholesale in the Wholesales List
        for(let wholesale of wholesales_list){
            // If ID is the same
            if(wholesale.id == ui_id)
                // Matching Wholesale has been found
                wholesale_found = true;
        }

        // If no matching Wholesale has been found
        if(!wholesale_found)
            // Remove the Wholesale UI
            wholesale_ui.remove();
    }
});