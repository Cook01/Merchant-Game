import { Random } from "../utils/Random.js";

//============================================================= Wholesale ========================================================
export class Wholesale{
    constructor(id, despawn_timer){
        this.id = id;
        this.despawn_timer = despawn_timer;

        this.category_list = {};
        this.bid_list = [];
    }

    // Add Item to Wholesale Item List
    addItem(category, quantity){
        // Item has not been found yet
        let category_found = false;

        // For each Element in Wholesale Item List
        for(let id in this.category_list){
            // If element is the correct Item
            if(category.id == id){
                // Add Quantity to the Wishlist Item
                this.category_list[id].add(quantity);
                // Item has been Found
                category_found = true;
            }
        }

        // If Item has not been Found
        if(!category_found)
            // Create a new Wholesale Item List Slot for Item
            this.category_list[category.id] = new Slot(category, quantity);
    }

    // Generate a Random Wholesale
    static generateRandomWholesale(id, category_list, despawn_timer){

        let new_wholesale = new Wholesale(id, despawn_timer);
        let quantity = Random.uniformInt(3, 5);

        for(let i = 0; i < quantity; i++){
            // Add a Random Item to the Wholesale Item List
            new_wholesale.addItem(Random.choose(category_list), Random.choose([5, 10]));
        }

        // Generate the Wholesale
        return new_wholesale;
    }

    // Add (or Update) a Bid to the Wholesale
    addBid(player, money){
        // Get Player Money
        let money_usable = player.money;
        // Player has no yet been found in the Bid List
        let player_found = false;

        // For each Bid in Bid List
        for(let i in this.bid_list){
            // If Player is the same
            if(this.bid_list[i].player.getID() === player.getID()){
                // Add Bid to Player's usable Money
                money_usable += parseInt(this.bid_list[i].money);

                // Check that the Bid is <= usable Money
                if(money > money_usable)
                    money = money_usable;

                // Change the Bid for that Player
                this.bid_list[i].changeBid(money);
                // Player has been found
                player_found = true;

                // If new Bid <= 0 : Remove it from Bid List (Player has exit the Bidding)
                if(this.bid_list[i].money <= 0)
                    this.bid_list.splice(i, 1);
            }
        }

        // If Player has not been found (New Bid)
        if(!player_found){
            // Check that the Bid is <= usable Money
            if(money > money_usable)
                money = money_usable;

            // If new Bid > 0 : Add the new Bid
            if(money > 0)
                this.bid_list.push(new Bid(player, money));
        }
    }

    // End the Bidding for this Wholesale an Select the Winner
    endBid(){
        // If there is at least one Bid
        if(this.bid_list.length > 0){
            // Sort the Bid List (Best Bid is first)
            this.bid_list.sort((a, b) => (a.money < b.money) ? 1 : -1);

            // Get the First Bid (the Best one = Winner)
            let winner = this.bid_list.splice(0, 1)[0];
            
            // For each Item in Wholesale Item List
            for(let i in this.category_list){
                for(let j = 0; j < this.category_list[i].quantity; j++){
                    let item = this.category_list[i].category.getRandomItem();
                    // Add Item to the Winner Inventory
                    winner.player.inventory.addItem(item, 1, winner.money);
                }
            }
            // Update the Winner
            winner.player.update();

            // For each other Bids (Loosers)
            for(let bid of this.bid_list){
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

//============================================================= Item Slot ========================================================

class Slot{
    constructor(category, quantity){
        this.category = category;
        this.quantity = quantity;
    }

    // Add Quantity to the Wishlist Slot Quantity
    add(quantity){
        this.quantity += parseInt(quantity);
    }

    // Remove Quantity to the  Wishlist Slot Quantity
    remove(quantity){
        this.quantity -= parseInt(quantity);

        // Check that quantity allways >= 0
        if(this.quantity < 0)
            this.quantity = 0;
    }
}