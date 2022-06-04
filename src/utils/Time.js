export class Time{
    static displayTime(input){

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
}