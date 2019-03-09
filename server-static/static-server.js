'use strict';

const fs = require('fs');
const path = require('path');
const express = require('express');
const httpsRedirect = require('express-https-redirect');
const Mustache = require('mustache');
const bunyan = require('bunyan');

const build = process.env.DEBUG ? require('./build') : null;

class StaticServer {

    constructor(httpServer, app) {
        this.httpServer = httpServer;
        this.app = app;

        // Redirect to HTTPS when in prod
        if (!process.env.DEBUG) {
            this.app.use('/', httpsRedirect());
        }

        // Static assets
        this.app.use('/assets', express.static('assets', {
            'maxage': 7 * 24 * 3600 * 1000
        }));
        this.app.use('/css', express.static('client/css'));

        // HTML
        if (process.env.DEBUG) {
            // Regular files
            this.app.get('/debug', html(['/libs.js', '/debug.js']));
            this.app.get('/mangled', html(['/libs.js', '/mangled.js']));
            this.app.get('/minified', html(['/libs.js', '/minified.js']));
        }

        this.app.get('/', html(['/bundle-main.js']));

        // Scripts
        if (process.env.DEBUG) {
            this.app.use('/libs.js', express.static('build/libs.js'));

            // Regular game files
            this.app.get('/debug.js', generateScript(() => build.debug(), __dirname + '/../build/debug.js'));
            this.app.get('/mangled.js', generateScript(() => build.mangled(), __dirname + '/../build/mangled.js'));
            this.app.get('/minified.js', generateScript(() => build.mangled(), __dirname + '/../build/minified.js'));
        }

        this.app.get('/bundle-main.js', (req, res) => { res.sendFile(path.resolve(__dirname + '/../build/bundle-main.js')); });

        function renderHTML(scripts) {
            return new Promise((resolve, reject) => {
                const templatePath = __dirname + '/../client/index.html';

                fs.readFile(templatePath, (err, data) => {
                    if (err) {
                        reject(err);
                        return;
                    }

                    const template = data.toString();

                    const rendered = Mustache.render(template, {
                        'scripts': scripts
                    });

                    resolve(rendered);
                });
            });
        }

        function html(scripts) {
            return (req, res) => {
                return renderHTML(scripts).then(html => {
                    res.send(html);
                }).catch(err => {
                    console.error(err);
                    res.status(500);
                    res.json(err);
                });
            };
        }

        function generateScript(generator, scriptPath) {
            return (req, res) => {
                const t1 = Date.now();

                generator().on('end', () => {
                    const t2 = Date.now();

                    const log = bunyan.createLogger({'name': 'HTTPServerPool'});
                    log.info('Compiled in ' + ((t2 - t1) / 1000) + 's');


                    // Aaaand then respond
                    const filePath = path.resolve(scriptPath);
                    res.sendFile(filePath);
                });
            };
        }
    }

}

module.exports = StaticServer;
