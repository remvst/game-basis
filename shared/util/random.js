'use strict';

class Random {

    static randInt(min, max) {
        return ~~(Random.randFloat(min, max + 1));
    }

    static randFloat(min, max) {
        return Math.random() * (max - min) + min;
    }

    static randPick(values) {
        if (values.length === 0) {
            return null;
        }
        return values[Random.randInt(0, values.length - 1)];
    }

    static randPickSet(values, n) {
        values = values.slice();

        const result = [];
        for (let i = 0 ; i < n && values.length ; i++) {
            const pickedIndex = Random.randInt(0, values.length - 1);
            result.push(values[pickedIndex]);
            values.splice(pickedIndex, 1);
        }

        return result;
    }

    static randBool(likelihood) {
        return Math.random() < likelihood;
    }

}

module.exports = Random;
