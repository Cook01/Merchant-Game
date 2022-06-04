export class Time{

    // Display timers at format "HH:mm:ss" (or "mm:ss")
    static displayTime(input){

        // Check that input >= 0 (timers can't be < 0)
        if(input < 0)
            input = 0;

        // Get Seconds
        let seconds = Math.floor(input % 60);
        // Get Minutes
        let minutes = Math.floor(input / 60);
        
        // If there is at least 1 Hour
        if(minutes >= 60){
            // Get Hours
            let hours = Math.floor(minutes / 60);
            // Re-Calculate the Minutes
            minutes = Math.floor(minutes % 60);

            // Format and return timer "HH:mm:ss"
            return hours.toString().padStart(2, "0") + ":" + minutes.toString().padStart(2, "0") + ":" + seconds.toString().padStart(2, "0");
        } else {
            // Format and return timer "mm:ss"
            return minutes.toString().padStart(2, "0") + ":" + seconds.toString().padStart(2, "0");
        }
    }

    // Return nb seconds from inputs
    static getSeconds(seconds = 0, minutes = 0, hours = 0){
        // 1 Seconds in each Seconds
        // 60 Seconds in each Minutes
        // 60 Minutes in each Hours
        return (seconds + (minutes * 60) + (hours * 60 * 60));
    }
}