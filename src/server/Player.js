const { Inventory } = require("./Inventory");
const { Item } = require("./Item");

class Player{
    constructor(socket, pseudo, money){
        this.socket = socket;
        this.pseudo = pseudo;
        this.money = money;

        this.inventory = new Inventory();

        this.update();
    }

    // Return Player ID (= Socket ID)
    getID(){
        return this.socket.id;
    }


    // Player Buy Item from the Market
    buy(market, item, quantity){
        // If Market has the Item
        if(market.hasItem(item) && market.getQuantity(item) >= quantity){
            // Get Item price
            let price = market.getPrice(item);
            // Calculate the price of the Buy Order
            let buyOrderPrice = price * quantity;

            // If Player has enought money
            if(this.money >= buyOrderPrice){
                // Player pay the Market
                this.money -= parseInt(buyOrderPrice);

                // Player get the Item(s)
                this.inventory.addItem(item, quantity, price);
                // Market remove the Item(s)
                market.removeItem(item, quantity);

            } else {
                // Not enought money
                this.socket.emit("Failure", "You don't have enought money"); 
            }
        } else {
            // Not enought Item in market
            this.socket.emit("Failure", "Market doesn't have enought " + item.name);
        }

        // Update Player Infos
        this.update();
    }

    // Player Sell Item to the Market
    sell(market, item, quantity){
        // If Inventory has the Item
        if(this.inventory.hasItem(item) && this.inventory.getQuantity(item) >= quantity){
            // Get Item price 
            let price = this.inventory.getPrice(item);

            // Market pay the Player
            this.money += parseInt(price * quantity);

            // Player remove the Item(s)
            this.inventory.removeItem(item, quantity);
            // Market get the Item(s)
            market.addItem(item, quantity, price);

        } else {
            // Not enought Item in Inventory
            this.socket.emit("Failure", "You don't have enought " + item.name);
        }

        // Update Player Infos
        this.update();
    }

    // Player change the Price of an Item
    changePrice(item, newPrice){
        // Change the Price of the Item in the Inventory
        this.inventory.setPrice(item, newPrice);
        // Update Player infos
        this.update();
    }

    // Update Player infos
    update(){
        // Clone this Player
        let player = {...this};
        // Remove the Socket from the clone
        delete player.socket;

        // Send Player Info to the Client
        this.socket.emit("Update Player", player);
    }
}

module.exports = { Player };