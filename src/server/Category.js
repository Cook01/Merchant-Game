import { Random } from "../utils/Random.js";

export class Category{
    constructor(id, name){
        this.id = id;
        this.name = name;

        this.item_list = [];
    }

    // Add Item to this Category
    addItem(item){
        // If Category doesn't already has the Item
        if(this.item_list.find((x) => {return (x.id == item.id)}) == undefined)
            // Add quantity to the Inventory Slot
            this.item_list.push(item);
    }

    // Remove Item from the Category
    remove(item){
        // Get the Item index
        let index_to_remove = this.item_list.findIndex((x) => {return (x.id == item.id)});

        // If index exist (Item is in Category)
        if(index_to_remove != -1)
            // Remove the Item from the Category
            this.item_list.splice(index_to_remove, 1);
    }


    getRandomItem(){
        return Random.choose(this.item_list);
    }
}