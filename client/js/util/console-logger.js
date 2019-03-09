'use strict';

const Logger = require('../../../shared/util/logger');

class ConsoleLogger extends Logger {

    debug(s) {
        console.debug(s);
    }

    info(s) {
        console.info(s);
    }

    warn(s) {
        console.warn(s);
    }

    error(s) {
        console.error(s);
    }

}

module.exports = ConsoleLogger;
