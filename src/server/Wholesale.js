//============================================================= Wholesale ========================================================
class Wholesale{
    constructor(id, item, quantity){
        this.id = id;

        this.item = item;
        this.quantity = quantity;

        this.timer = 3 * 60; // 3 min

        this.bidList = [];
    }

    static generateRandomWholesale(id, itemList){
        //Generate random item ID
        let itemListKey = Object.keys(itemList);
        let rndKeyIndex = Math.floor(Math.random() * itemListKey.length);
        let rndKey = itemListKey[rndKeyIndex];

        //Get the associated item
        let rndItem = itemList[rndKey];

        let quantity = Math.floor(Math.random() * (10 - 5) + 5)

        return new Wholesale(id, rndItem, quantity);
    }

    addBid(player, money){
        let moneyDisp = player.money;
        let playerFound = false;

        for(let bid of this.bidList){
            if(bid.player.getID() === player.getID()){
                moneyDisp += parseInt(bid.money);

                if(money > moneyDisp)
                    money = moneyDisp;

                bid.changeBid(money);
                playerFound = true;
            }
        }

        if(!playerFound){
            if(money > moneyDisp)
                money = moneyDisp;

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

module.exports = { Wholesale };