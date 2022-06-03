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