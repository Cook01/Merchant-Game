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
        let itemfound = false;

        // For each Element in Wishlist
        for(let id in this.wishlist){
            // If element is the correct Item
            if(item.id == id){
                // Add Quantity to the Wishlist Item
                this.wishlist[id].add(quantity);
                // Item Found
                itemfound = true;
            }
        }

        // If Item not Found
        if(!itemfound)
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
    generateRandomWishlist(itemList){
        // Generate random nb of item to add (between 1 and 2 times Item List length)
        let nbItems = Random.uniformInt(1, Object.keys(itemList).length * 2);

        // Loop nbItem times
        for(let i = 0; i < nbItems; i++){
            // Get a Random Item from Item List
            let rnd_Item = Random.choose(itemList);

            // Add 1 or 2 times the item to the wishlist
            this.addItemToWishlist(rnd_Item, Random.uniformInt(1, 2));
        }
    }

    // Customer Shopping action
    shop(playerList){
        // For each Item in wishlist
        for(let elementId in this.wishlist){
            // Int Price List
            let priceList = []
            // Get the Item
            let item = this.wishlist[elementId].item;

            // For each Player
            for(let playerId in playerList){
                // Get Player
                let player = playerList[playerId];
                // Get Price for the Item in Player Inventory
                let itemPrice = player.inventory.getPrice(item);

                // If Price exist (Payer do Sell the Item)
                if(itemPrice != -1){
                    // Add new entry in Price List
                    priceList.push({
                        "player": player,
                        "price": itemPrice
                    });
                }
            }

            // Sort Price List (cheapest first)
            priceList.sort((a, b) => (a.price > b.price) ? 1 : -1);

            // If Price List have any entry (at least one Player sell the Item)
            if(priceList.length > 0){
                // Get the first entry from Price List (cheapest)
                let priceEntry = priceList[0];

                // Get selling Player
                let player = priceEntry.player;
                // Get selling Price
                let price = priceEntry.price;

                // Quatity = Min between quantity wished and quantity avalable
                let quantity = Math.min(this.wishlist[elementId].quantity, player.inventory.getQuantity(item));
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
            
            // Highlight Sale
            player.pingItem(item);
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