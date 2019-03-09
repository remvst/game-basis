'use strict';

const SetUtils = {};

SetUtils.equal = (setA, setB) => {
    return setA.size === setB.size && SetUtils.all(setA, x => setB.has(x));
};

SetUtils.all = (set, pred) => {
    for (let a of set) {
        if (!pred(a)) {
            return false;
        }
    }
    return true;
};

module.exports = SetUtils;
