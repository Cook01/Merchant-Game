export class Random{
    static #boxMullerTransform() {
        const u1 = Math.random();
        const u2 = Math.random();
        
        const z0 = Math.sqrt(-2.0 * Math.log(u1)) * Math.cos(2.0 * Math.PI * u2);
        const z1 = Math.sqrt(-2.0 * Math.log(u1)) * Math.sin(2.0 * Math.PI * u2);
        
        return { z0, z1 };
    }
    
    static normal(mean = 0, std_dev = 1) {
        const { z0, _ } = Random.#boxMullerTransform();
        
        return ((z0 * std_dev) + mean);
    }

    static normalInt(mean = 0, std_dev = 1){
        return Math.round(Random.normal(mean, std_dev));
    }

    static uniform(min = 0, max = 1){
        return ((Math.random() * (max - min)) + min);
    }

    static uniformInt(min = 0, max = 1){
        return Math.round(Random.uniform(min, max));
    }

    static choose(array){
        var keys = Object.keys(array);
        return array[keys[Math.floor(Random.uniform(0, keys.length))]];
    }
}