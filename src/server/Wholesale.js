import { Random } from "../utils/Random.js";

//============================================================= Wholesale ========================================================
export class Wholesale{
    constructor(id, item, quantity){
        this.id = id;

        this.item = item;
        this.quantity = quantity;

        this.timer = 3 * 60; // 3 min

        this.bidList = [];
    }

    static generateRandomWholesale(id, itemList){
        // //Generate random item ID
        // let itemListKey = Object.keys(itemList);

        // let rndKeyIndex = Math.floor(Math.random() * itemListKey.length);
        // let rndKey = itemListKey[rndKeyIndex];

        // //Get the associated item
        // let rndItem = itemList[rndKey];

        let rnd_item = Random.choose(itemList);

        let quantity = Random.uniformInt(5, 10);

        return new Wholesale(id, rnd_item, quantity);
    }

    addBid(player, money){
        let moneyDisp = player.money;
        let playerFound = false;

        for(let i in this.bidList){
            if(this.bidList[i].player.getID() === player.getID()){
                moneyDisp += parseInt(this.bidList[i].money);

                if(money > moneyDisp)
                    money = moneyDisp;

                this.bidList[i].changeBid(money);
                playerFound = true;

                if(this.bidList[i].money == 0)
                    this.bidList.splice(i, 1);
            }
        }

        if(!playerFound){
            if(money > moneyDisp)
                money = moneyDisp;

            if(money > 0)
                this.bidList.push(new Bid(player, money));
        }
    }

    endBid(){
        if(this.bidList.length > 0){
            this.bidList.sort((a, b) => (a.money < b.money) ? 1 : -1);

            let winner = this.bidList.splice(0, 1)[0];
            
            winner.player.inventory.addItem(this.item, this.quantity, Math.floor(winner.money / this.quantity));
            winner.player.update();

            for(let bid of this.bidList){
                bid.player.money += parseInt(bid.money);
                bid.player.update();
            }
        }
    }
}

//============================================================= Bid ========================================================

class Bid{
    constructor(player, money){
        this.player = player;

        this.player.money -= money;
        this.money = money;

        this.player.update();
    }

    changeBid(money){
        let offset = money - this.money;

        this.player.money -= offset;
        this.money = money;

        this.player.update();
    }
}