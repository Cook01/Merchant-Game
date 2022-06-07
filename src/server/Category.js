import { Random } from "../utils/Random.js";
import _ from "lodash";

export class Category{
    constructor(id, name){
        this.id = id;
        this.name = name;

        this.item_list = [];
    }

    // Check if the Category has the Item
    hasItem(item){
        return this.item_list.findIndex((x) => {return (x.id == item.id)}) != -1;
    }

    // Check if the Category is empty
    isEmpty(){
        return this.item_list.length == 0;
    }

    // Add Item to this Category
    addItem(item){
        // If Category doesn't already has the Item
        if(!this.hasItem(item))
            // Add Item to the Category
            this.item_list.push(item);
    }

    // Remove Item from the Category
    removeItem(item){
        // Get the Item index
        let index_to_remove = this.item_list.findIndex((x) => {return (x.id == item.id)});

        // If index exist (Item is in Category)
        if(index_to_remove != -1)
            // Remove the Item from the Category
            this.item_list.splice(index_to_remove, 1);
    }

    // Get a Random Item from this Category
    getRandomItem(){
        return Random.choose(this.item_list);
    }

    getSendable(){
        let category_sendable = _.cloneDeep(this);

        delete category_sendable.item_list;

        return category_sendable;
    }
}