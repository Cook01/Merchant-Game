export class Time{
    static displayTime(input){

        if(input < 0)
            input = 0;

        let seconds = Math.floor(input % 60);
        let minutes = Math.floor(input / 60);
        
        if(minutes >= 60){
            let hours = Math.floor(minutes / 60);
            minutes = Math.floor(minutes % 60);

            return hours.toString().padStart(2, "0") + ":" + minutes.toString().padStart(2, "0") + ":" + seconds.toString().padStart(2, "0");
        } else {
            return minutes.toString().padStart(2, "0") + ":" + seconds.toString().padStart(2, "0");
        }
    }

    static getSeconds(seconds = 0, minutes = 0, hours = 0){
        return (seconds + (minutes * 60) + (hours * 60 * 60));
    }
}