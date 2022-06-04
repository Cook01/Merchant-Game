export class Random{
    // Generate random guaussian coordonates with the Box-Muller Transform method
    // (https://en.wikipedia.org/wiki/Box%E2%80%93Muller_transform)
    static #boxMullerTransform() {
        const u1 = Math.random();
        const u2 = Math.random();
        
        const z0 = Math.sqrt(-2.0 * Math.log(u1)) * Math.cos(2.0 * Math.PI * u2);
        const z1 = Math.sqrt(-2.0 * Math.log(u1)) * Math.sin(2.0 * Math.PI * u2);
        
        return { z0, z1 };
    }
    
    // Generate normaly distributated Float based on Mean and Standard Deviation
    static normal(mean = 0, std_dev = 1) {
        const { z0, _ } = Random.#boxMullerTransform();
        
        return ((z0 * std_dev) + mean);
    }

    // Generate normaly distributated Integer based on Mean and Standard Deviation
    static normalInt(mean = 0, std_dev = 1){
        return Math.round(Random.normal(mean, std_dev));
    }


    // Generate uniformaly distributated Float in Range [min, max)
    static uniform(min = 0, max = 1){
        return ((Math.random() * (max - min)) + min);
    }

    // Generate uniformaly distributated Integer in Range [min, max]
    static uniformInt(min = 0, max = 1){
        return Math.round(Random.uniform(min, max));
    }

    // Choose a random entry from Array (or List Object)
    static choose(array){
        var keys = Object.keys(array);
        return array[keys[Math.floor(Random.uniform(0, keys.length))]];
    }
}