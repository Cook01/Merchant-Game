class Customer{
    constructor(money = 100, SHOPING_RATE = 1/30){
        this.SHOPING_RATE = SHOPING_RATE;

        this.money = money;
        this.wishlist = {};
    }

    addItemToWishlist(item, quantity){
        let itemfound = false;

        for(let id in this.wishlist){
            if(item.id == id){
                this.wishlist[id].add(quantity);
                itemfound = true;
            }
        }

        if(!itemfound)
            this.wishlist[item.id] = new WishlistSlot(item, quantity);
    }

    removeItemFromWishlist(item, quantity){
        for(let id in this.wishlist){
            if(item.id == id){
                this.wishlist[id].remove(quantity);

                if(this.wishlist[id].quantity <= 0)
                    delete this.wishlist[id];
            }
        }
    }

    generateRandomWishlist(itemList){
        //Get list of item IDs
        let itemListKey = Object.keys(itemList);

        //Generate random nb of item to add
        let nbItems = Math.floor(Math.random() * ((itemListKey.length * 2) - 1) + 1); // Rand * (max - min) + min

        for(let i = 0; i < nbItems; i++){
            //Generate random item ID
            let rndKeyIndex = Math.floor(Math.random() * itemListKey.length);
            let rndKey = itemListKey[rndKeyIndex];

            //Get the associated item
            let rndItem = itemList[rndKey];

            //Add 1 or 2 times the item to the wishlist
            this.addItemToWishlist(rndItem, Math.floor(Math.random() * (2 - 1) + 1));  // Rand * (max - min) + min
        }
    }

    shop(playerList){
        if(Math.random() < this.SHOPING_RATE){
            console.log("Customer shop");

            for(let elementId in this.wishlist){
                let priceList = []
                let item = this.wishlist[elementId].item;

                for(let playerId in playerList){
                    let player = playerList[playerId];
                    let itemPrice = player.inventory.getPrice(item);

                    if(itemPrice != -1){
                        priceList.push({
                            "player": player,
                            "price": itemPrice
                        });
                    }
                }

                priceList.sort((a, b) => (a.price > b.price) ? 1 : -1);

                if(priceList.length > 0){
                    let priceEntry = priceList[0];
                    let itemToBuy = this.wishlist[elementId].item;

                    let player = priceEntry.player;
                    let price = priceEntry.price;

                    let quantityToBuy = Math.min(this.wishlist[elementId].quantity, player.inventory.getQuantity(itemToBuy));
                    quantityToBuy = Math.min(quantityToBuy, Math.floor(this.money / price));

                    this.buy(player, itemToBuy, quantityToBuy);
                }
            }
        }
    }


    buy(player, item, quantity){
        let price = player.inventory.getPrice(item);
        if(this.money >= quantity * price){
            player.money += quantity * price;
            this.money -= quantity * price;

            player.inventory.removeItem(item, quantity);
            this.removeItemFromWishlist(item, quantity);

            player.update();
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

        if(this.quantity < 0)
            this.quantity = 0;
    }
}

module.exports = { Customer }