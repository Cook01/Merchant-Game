import { Random } from "../utils/Random.js";

export class Customer{
    constructor(money, shopping_timer, despawn_timer){
        this.shopping_timer = shopping_timer;
        this.despawn_timer = despawn_timer;

        this.money = money;
        this.wishlist = {};
    }

    // Add an Item to the Wishlist
    addItemToWishlist(item, quantity){
        // Init Item found to False
        let item_found = false;

        // For each Element in Wishlist
        for(let id in this.wishlist){
            // If element is the correct Item
            if(item.id == id){
                // Add Quantity to the Wishlist Item
                this.wishlist[id].add(quantity);
                // Item Found
                item_found = true;
            }
        }

        // If Item not Found
        if(!item_found)
            // Create a new Wishlist entry for Item
            this.wishlist[item.id] = new WishlistSlot(item, quantity);
    }

    // Remove an Item from Wishlist
    removeItemFromWishlist(item, quantity){
        // For each element in Wishlist
        for(let id in this.wishlist){
            // If element is the correct Item
            if(item.id == id){
                // Remove Quantity from Wishlist
                this.wishlist[id].remove(quantity);

                // If wishlist element quantity is <= 0
                if(this.wishlist[id].quantity <= 0)
                    // Remove wishlist entry
                    delete this.wishlist[id];
            }
        }
    }

    // Generate a Random Wishlist
    generateRandomWishlist(item_list){
        // Generate random nb of item to add (between 1 and 2 times Item List length)
        let nbItems = Random.uniformInt(1, Object.keys(item_list).length * 2);

        // Loop nbItem times
        for(let i = 0; i < nbItems; i++){
            // Get a Random Item from Item List
            let rnd_Item = Random.choose(item_list);

            // Add 1 or 2 times the item to the wishlist
            this.addItemToWishlist(rnd_Item, Random.uniformInt(1, 2));
        }
    }

    // Customer Shopping action
    shop(player_list){
        // For each Item in wishlist
        for(let element_id in this.wishlist){
            // Int Price List
            let price_list = []
            // Get the Item
            let item = this.wishlist[element_id].item;

            // For each Player
            for(let playerId in player_list){
                // Get Player
                let player = player_list[playerId];
                // Get Price for the Item in Player Inventory
                let item_price = player.inventory.getPrice(item);

                // If Price exist (Payer do Sell the Item)
                if(item_price != -1){
                    // Add new entry in Price List
                    price_list.push({
                        "player": player,
                        "price": item_price
                    });
                }
            }

            // Sort Price List (cheapest first)
            price_list.sort((a, b) => (a.price > b.price) ? 1 : -1);

            // If Price List have any entry (at least one Player sell the Item)
            if(price_list.length > 0){
                // Get the first entry from Price List (cheapest)
                let price_entry = price_list[0];

                // Get selling Player
                let player = price_entry.player;
                // Get selling Price
                let price = price_entry.price;

                // Quatity = Min between quantity wished and quantity avalable
                let quantity = Math.min(this.wishlist[element_id].quantity, player.inventory.getQuantity(item));
                // Quantity = Min between previous result and what the budget allow
                quantity = Math.min(quantity, Math.floor(this.money / price));

                // Buy the Item
                this.buy(player, item, quantity);
            }
        }
    }


    // Buy the Item from a Player
    buy(player, item, quantity){
        // Get the Item Price
        let price = player.inventory.getPrice(item);

        // If Budget allow the buy
        if(this.money >= quantity * price){
            // Give money to Player
            player.money += quantity * price;
            // Remove money from Customer
            this.money -= quantity * price;

            // Remove Item from Player Inventory
            player.inventory.removeItem(item, quantity);
            // Remove Item from Customer Wishlist
            this.removeItemFromWishlist(item, quantity);

            // Update Player
            player.update();
            
            // // Highlight Sale
            // player.pingItem(item);
        }
    }
}

//============================================================= Wishlist Slot ========================================================

// Contain the Item info for an Item that the Customer wish to buy
class WishlistSlot{
    constructor(item, quantity){
        this.item = item;
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