'use strict';

module.exports = function(label, func) {
    const t1 = window.performance.now();
    func();
    const t2 = window.performance.now();

    const execTime = t2 - t1;
    console.log(label + ': ' + execTime + 'ms');

    return execTime;
};
