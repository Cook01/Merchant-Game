import { Inventory } from "./Inventory.js";

export class Market extends Inventory{
    constructor(){
        super();
    }

    removeItem(item, quantity){
        if(this.hasItem(item))
            this.slotList[item.id].remove(quantity);
    }
}