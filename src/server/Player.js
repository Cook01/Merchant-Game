class Player{
    constructor(socket, pseudo, money){
        this.socket = socket;
        this.pseudo = pseudo;
        this.money = money;
    }


    // Update Player infos
    update(){
        let player = {...this};
        delete player.socket;

        // Send Player Info to the Client
        this.socket.emit("Update Player", player);
    }
}

module.exports = Player;