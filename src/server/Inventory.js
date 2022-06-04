//============================================================= Inventory ========================================================

// Inventory Container contains a list of Inventory Slots
export class Inventory{
    constructor(){
        this.slot_list = {};
    }

    // Check if Item is in inventory
    hasItem(item){
        // Item has not been found yet
        let item_found = false;

        // For each item in the Slot List
        for(let id in this.slot_list){
            // If Item is the same, Item has been found
            if(item.id == id){
                item_found = true;
            }
        }

        // Return if Item has been found
        return item_found;
    }

    // Add a certain Quantity of an Item
    addItem(item, quantity, price){
        // If Inventory already has the item
        if(this.hasItem(item))
            // Add quantity to the Inventory Slot
            this.slot_list[item.id].add(quantity);
        else
            // Create a new Inventory Slot and set Item, Quantity and Price
            this.slot_list[item.id] = new InventorySlot(item, quantity, price);

        // If Item new quantity <= 0
        if(this.getQuantity(item) <= 0)
            // Remove Inventory Slot from Inventory
            delete this.slot_list[item.id];
    }

    // Remove a certain Quantity of an Item
    removeItem(item, quantity){
        // If Inventory already has the item
        if(this.hasItem(item))
            // Remove quantity to the Inventory Slot
            this.slot_list[item.id].remove(quantity);

        // If Item new quantity <= 0
        if(this.getQuantity(item) <= 0)
            // Remove Inventory Slot from Inventory
            delete this.slot_list[item.id];
    }

    // Get the current Price of an Item in the Inventory
    getPrice(item){
        // If Inventory already has the Item
        if(this.hasItem(item))
            // Return Inventory Slot Price
            return this.slot_list[item.id].price;
        else
            // Return -1 for the error
            return -1;
    }

    // Set the Price of an Item in the Inventory
    setPrice(item, new_price){
        // If Inventory has the Item
        if(this.hasItem(item))
            // Return Inventory Slot Price
            this.slot_list[item.id].setPrice(new_price);
    }

    // Get the current Price of an Item in the Inventory
    getQuantity(item){
        // If Inventory already has the Item
        if(this.hasItem(item))
            // Return the Quantity of Item in the Inventory Slot
            return this.slot_list[item.id].quantity;
        else
            // Quantity = 0
            return 0;
    }
}

//============================================================= Inventory Slot ========================================================

// Inventory Slot contain the Item, the Quantity and the current Price
class InventorySlot{
    constructor(item, quantity, price){
        this.item = item;
        this.quantity = parseInt(quantity);
        this.price = parseInt(price);
    }

    // Add Quantity to the Inventory Slot Quantity
    add(quantity){
        this.quantity += parseInt(quantity);
    }

    // Remove Quantity to the Inventory Slot Quantity
    remove(quantity){
        this.quantity -= parseInt(quantity);

        // Check that Quantity allways >= 0
        if(this.quantity < 0)
            this.quantity = 0;
    }

    // Set the Price of the Inventory Slot
    setPrice(new_price){
        // Check that price allways >= 0
        if(new_price < 0)
            new_price = 0;

        // Set new Price
        this.price = new_price;
    }
}