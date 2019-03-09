'use strict';

module.exports = function() {
    return Math.floor(Math.random() * 0xffffffff)
        .toString(36);
};
