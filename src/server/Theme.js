import { Random } from "../utils/Random.js";

export class Theme{
    constructor(id, name){
        this.id = id;
        this.name = name;

        this.category_list = [];
    }

    // Add Category to this Theme
    addCategory(category){
        // If Theme doesn't already has the Category
        if(this.category_list.find((x) => {return (x.id == category.id)}) == undefined)
            // Add Category to the Theme
            this.category_list.push(category);
    }

    // Remove Category from the Theme
    removeCategory(category){
        // Get the Category index
        let index_to_remove = this.category_list.findIndex((x) => {return (x.id == category.id)});

        // If index exist (Category is in Theme)
        if(index_to_remove != -1)
            // Remove the Category from the Theme
            this.category_list.splice(index_to_remove, 1);
    }

    // Get a Random Category from this Theme
    getRandomCategory(){
        return Random.choose(this.category_list);
    }



    // Add Item to this Theme
    addItem(item, category){
        // Add the Item to the Category
        category.addItem(item);
        // Add the Category to the Theme
        this.addCategory(category);
    }

    // Remove Item from the Theme
    removeItem(item){
        // Get the Category index (get the Category that has)
        let index_to_remove = this.category_list.findIndex((x) => {return (x.hasItem(item))});

        // If Item is in one of the Categories from the Theme
        if(index_to_remove != -1){
            // Remove Item from Category
            this.category_list[index_to_remove].removeItem(item);

            // If the Category is now Empty
            if(this.category_list[index_to_remove].isEmpty()){
                // Remove the Category
                this.removeCategory(this.category_list[index_to_remove]);
            }
        }
    }

    // Get a Random Item from the Theme
    getRandomItem(){
        return this.getRandomCategory().getRandomItem();
    }
}