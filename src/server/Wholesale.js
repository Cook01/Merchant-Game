import { Random } from "../utils/Random.js";
import { Time } from "../utils/Time.js";
import _ from "lodash";

//============================================================= Wholesale ========================================================
export class Wholesale{
    constructor(id, theme, despawn_timer){
        this.id = id;
        this.max_despawn_time = despawn_timer;
        this.despawn_timer = despawn_timer;

        this.theme = theme;
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
    static generateRandomWholesale(id, theme_list, despawn_timer){
        let theme = Random.choose(theme_list);
        let new_wholesale = new Wholesale(id, theme, despawn_timer);
        let quantity = Random.uniformInt(3, 5);

        for(let i = 0; i < quantity; i++){
            // Add a Random Item to the Wholesale Item List
            new_wholesale.addItem(theme.getRandomCategory(), Random.choose([5, 10]));
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

        let last_winning_player = undefined;
        let last_winning_bid = -1;
        for(let i in this.bid_list){
            if(this.bid_list[i].money >= last_winning_bid){
                last_winning_bid = this.bid_list[i].money;
                last_winning_player = this.bid_list[i].player;
            }
        }


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


        let new_winning_player = undefined;
        let new_winning_bid = -1;
        for(let i in this.bid_list){
            if(this.bid_list[i].money >= new_winning_bid){
                new_winning_bid = this.bid_list[i].money;
                new_winning_player = this.bid_list[i].player;
            }
        }


        if((last_winning_player == undefined ||last_winning_player.getID() != new_winning_player.getID()) && last_winning_bid != new_winning_bid){
            let elapsed_time = this.max_despawn_time - this.despawn_timer;
            let bonus_time = elapsed_time / 4;

            this.despawn_timer += bonus_time;
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

    getSendable(){
        // Deep Clone Wholesale
        let wholesale_sendable = _.cloneDeep(this);

        wholesale_sendable.theme = wholesale_sendable.theme.getSendable();

        // For each Bid in Bid List of the Clone
        for(let i in wholesale_sendable.bid_list){
            wholesale_sendable.bid_list[i] = wholesale_sendable.bid_list[i].getSendable();
        }

        for(let i in wholesale_sendable.category_list){
            wholesale_sendable.category_list[i] =  wholesale_sendable.category_list[i].getSendable();
        }

        // Remove the Despawn Timer
        //delete wholesale_sendable.despawn_timer;

        return wholesale_sendable;
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

    getSendable(){
        let bid_sendable = _.cloneDeep(this);

        bid_sendable.player = bid_sendable.player.getSendable();

        return bid_sendable;
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

    getSendable(){
        let slot_sendable = _.cloneDeep(this);

        slot_sendable.category = slot_sendable.category.getSendable();

        return slot_sendable;
    }
}