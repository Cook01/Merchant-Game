import { Inventory } from "./Inventory.js";
import _ from "lodash";

export class Player{
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
    changePrice(item, new_price){
        // Change the Price of the Item in the Inventory
        this.inventory.setPrice(item, new_price);
        // Update Player infos
        this.update();
    }

    // TODO
    // pingItem(item){
    //     this.socket.emit("Ping Player Item", item);
    // }

    getSendable(){
        // Clone this Player
        let player_sendable = _.cloneDeep(this);

        // Stock Player ID
        player_sendable.id = this.getID();
        // Remove the Socket from the clone
        delete player_sendable.socket;

        player_sendable.inventory = player_sendable.inventory.getSendable();

        return player_sendable;
    }


    // Update Player infos
    update(){
        // Send Player Info to the Client
        this.socket.emit("Update Player", this.getSendable());
    }
}