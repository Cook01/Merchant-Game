import { Random } from "../utils/Random.js";
import _ from "lodash";

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
        let nbItems = Random.uniformInt(5, 10);

        // Loop nbItem times
        for(let i = 0; i < nbItems; i++){
            // Get a Random Item from Item List
            let rnd_Item = Random.choose(item_list);

            // Add 1 or 2 times the item to the wishlist
            this.addItemToWishlist(rnd_Item, 1);
        }
    }

    // Customer Shopping action
    shop(player_list, q1 = 1.5, q2 = 1, q3 = 0.5){
        
        let simulation = [];

        let total_wished_item = 0;

        for(let i in this.wishlist){
            total_wished_item += this.wishlist[i].quantity;
        }


        for(let i in player_list){
            let player_inventory = []

            let customer_clone = _.cloneDeep(this);

            let total_bought_item = 0;
            let customer_bought_items = {};

            for(let j in player_list[i].inventory.slot_list){
                player_inventory.push(player_list[i].inventory.slot_list[j]);
            }
            player_inventory.sort((a, b) => ((a.price > b.price) ? 1 : -1));

            let can_still_buy = false;
    
            do {
                can_still_buy = false;

                for(let slot of player_inventory){
                    if(customer_clone.wishlist[slot.item.id] != undefined){
                        if(slot.price <= customer_clone.money){
                            customer_clone.money -= slot.price;
                            total_bought_item ++;

                            if(customer_bought_items[slot.item.id] != undefined){
                                customer_bought_items[slot.item.id].quantity++;
                            } else {
                                customer_bought_items[slot.item.id] = {
                                    item : slot.item,
                                    quantity: 1
                                };
                            }

                            customer_clone.removeItemFromWishlist(slot.item, 1);
                            can_still_buy = true;

                            break;
                        }
                    }
                }
            } while(can_still_buy);

            let quantity_score = (total_bought_item - 0) / (total_wished_item - 0); // (x - min) / (max - min)
            let diversity_score = (Object.keys(customer_bought_items).length - 0) / (Object.keys(this.wishlist).length - 0); // (x - min) / (max - min)
            let prices_score = (customer_clone.money - 0) / (this.money - 0); // (x - min) / (max - min)

            let final_score = quantity_score * q1 + diversity_score * q2 + prices_score * q3;

            simulation.push({
                player_id: i,
                score: final_score
            });
        }

        simulation.sort((a, b) => ((a.score < b.score) ? 1 : -1));

        if(simulation.length > 0){
            let player_selected = player_list[simulation[0].player_id];
            let player_inventory = [];

            for(let j in player_selected.inventory.slot_list){
                player_inventory.push(player_selected.inventory.slot_list[j]);
            }
            player_inventory.sort((a, b) => ((a.price > b.price) ? 1 : -1));

            let can_still_buy = false;

            do {
                can_still_buy = false;

                for(let slot of player_inventory){
                    if(this.wishlist[slot.item.id] != undefined){
                        if(slot.price <= this.money){
                            this.buy(player_selected, slot.item, 1);
                            can_still_buy = true;

                            break;
                        }
                    }
                }
            } while(can_still_buy);
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

    getSendable(){
        let customer_sendable = _.cloneDeep(this);

        delete customer_sendable.shopping_timer;
        delete customer_sendable.despawn_timer;

        for(let i in customer_sendable.wishlist){
            customer_sendable.wishlist[i] = customer_sendable.wishlist[i].getSendable();
        }

        return customer_sendable;
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

    getSendable(){
        let slot_sendable = _.cloneDeep(this);

        slot_sendable.item = slot_sendable.item.getSendable();

        return slot_sendable;
    }
}