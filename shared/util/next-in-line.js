'use strict';

const Chance = require('chance');

function nextInLine(pool, existing) {
    const usedMap = {};

    existing.forEach(value => {
        usedMap[value] = usedMap[value] || 0;
        usedMap[value]++;
    });

    let leastUsedCount = Number.MAX_VALUE;
    let leastUsedValues = [];
    pool.forEach(value => {
        const usedCount = usedMap[value] || 0;

        if (usedCount < leastUsedCount) {
            leastUsedValues = [value];
            leastUsedCount = usedCount;
        } else if (usedCount === leastUsedCount) {
            leastUsedValues.push(value);
        }
    });

    return new Chance(1).pickone(leastUsedValues);
}

module.exports = nextInLine;
