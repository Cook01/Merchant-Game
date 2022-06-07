import _ from "lodash";

export class Item{
    constructor(id, name, theme, category){
        this.id = id;
        this.name = name;

        this.theme = theme;
        this.category = category;
    }

    getSendable(){
        let item_sendable = _.cloneDeep(this);

        item_sendable.theme = item_sendable.theme.getSendable();
        item_sendable.category = item_sendable.category.getSendable();

        return item_sendable;
    }
}