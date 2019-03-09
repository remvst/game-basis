'use strict';

const bunyan = require('bunyan');

const Logger = require('../shared/util/logger');

class BunyanLogger extends Logger {

    constructor(name) {
        super();
        this.logger = bunyan.createLogger({'name': name});
    }

    debug(s) {
        this.logger.debug(s);
    }

    info(s) {
        this.logger.info(s);
    }

    warn(s) {
        this.logger.warn(s);
    }

    error(s) {
        this.logger.error(s);
    }

}

module.exports = BunyanLogger;
