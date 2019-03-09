'use strict';

const through = require('through2');

module.exports = function(prefixGenerator) {
    return through.obj(function(file, encoding, callback) {
        const sourceCode = file.contents.toString();

        prefixGenerator(prefix => {
            file.contents = new Buffer(prefix + sourceCode);
            callback(null, file);
        });
    });
};
