import { Random } from "../utils/Random.js";

//============================================================= Wholesale ========================================================
export class Wholesale{
    constructor(id, item, quantity, despawn_timer){
        this.id = id;

        this.item = item;
        this.quantity = quantity;

        this.despawn_timer = despawn_timer;

        this.bidList = [];
    }

    // Generate a Random Wholesale
    static generateRandomWholesale(id, itemList, despawn_timer){

        // Choose a Random Item
        let rnd_item = Random.choose(itemList);
        // Get a Random Quanity
        let quantity = Random.uniformInt(5, 10);

        // Generate the Wholesale
        return new Wholesale(id, rnd_item, quantity, despawn_timer);
    }

    // Add (or Update) a Bid to the Wholesale
    addBid(player, money){
        // Get Player Money
        let moneyDisp = player.money;
        // Player has no yet been found in the Bid List
        let playerFound = false;

        // For each Bid in Bid List
        for(let i in this.bidList){
            // If Player is the same
            if(this.bidList[i].player.getID() === player.getID()){
                // Add Bid to Player's usable Money
                moneyDisp += parseInt(this.bidList[i].money);

                // Check that the Bid is <= usable Money
                if(money > moneyDisp)
                    money = moneyDisp;

                // Change the Bid for that Player
                this.bidList[i].changeBid(money);
                // Player has been found
                playerFound = true;

                // If new Bid <= 0 : Remove it from Bid List (Player has exit the Bidding)
                if(this.bidList[i].money <= 0)
                    this.bidList.splice(i, 1);
            }
        }

        // If Player has not been found (New Bid)
        if(!playerFound){
            // Check that the Bid is <= usable Money
            if(money > moneyDisp)
                money = moneyDisp;

            // If new Bid > 0 : Add the new Bid
            if(money > 0)
                this.bidList.push(new Bid(player, money));
        }
    }

    // End the Bidding for this Wholesale an Select the Winner
    endBid(){
        // If there is at least one Bid
        if(this.bidList.length > 0){
            // Sort the Bid List (Best Bid is first)
            this.bidList.sort((a, b) => (a.money < b.money) ? 1 : -1);

            // Get the First Bid (the Best one = Winner)
            let winner = this.bidList.splice(0, 1)[0];
            
            // Add Item to the Winner Inventory
            winner.player.inventory.addItem(this.item, this.quantity, Math.floor(winner.money / this.quantity));
            // Update the Winner
            winner.player.update();

            // For each other Bids (Loosers)
            for(let bid of this.bidList){
                // Refund the Bid
                bid.player.money += parseInt(bid.money);
                // Update the Player
                bid.player.update();
            }
        }
    }
}

//============================================================= Bid ========================================================

class Bid{
    constructor(player, money){
        this.player = player;

        // Player pay the Bid
        this.player.money -= money;
        this.money = money;

        this.player.update();
    }

    // Change an existing Bid
    changeBid(money){
        // Get the offset between last Bid and new Bid
        let offset = money - this.money;

        // Player pay the offset (if offset < 0, player get refund the offset)
        this.player.money -= offset;
        // Update the Bid
        this.money = money;

        // Update the Player
        this.player.update();
    }
}