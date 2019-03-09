'use strict';

const express = require('express');
const HTTPServer = require('http').Server;
const bunyan = require('bunyan');

class HTTPServerPool {

    constructor() {
        this.servers = {};
    }

    serverForPort(port) {
        if (!this.servers[port]) {
            const app = express();
            const server = HTTPServer(app);
            this.servers[port] = {
                'server': server,
                'express': app
            };
        }
        return this.servers[port];
    }

    start(server) {
        const log = bunyan.createLogger({'name': 'HTTPServerPool'});

        const listener = server.server.listen(process.env.PORT || 8000, () => {
            log.info('Server started on port ' + listener.address().port);
        });

        setInterval(() => {
            const memoryUsage = process.memoryUsage();
            log.info('RSS: ' + Math.round(memoryUsage.rss / 1024 / 1024) + ' megabytes');
        }, 10 * 1000);
    }

}

module.exports = HTTPServerPool;
