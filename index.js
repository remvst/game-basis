'use strict';

const StaticServer = require('./server-static/static-server');

const HTTPServerPool = require('./server-shared/http-server-pool');

const serverPool = new HTTPServerPool();
const server = serverPool.serverForPort(process.env.PORT || 8000);

new StaticServer(server.server, server.express);

serverPool.start(server);
