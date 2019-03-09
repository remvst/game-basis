'use strict';

const HTTPServerPool = require('../server-shared/http-server-pool');
const StaticServer = require('./static-server');

const serverPool = new HTTPServerPool();
const server = serverPool.serverForPort(process.env.PORT);

new StaticServer(server.server, server.express);

serverPool.start(server);
