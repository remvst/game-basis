'use strict';

const through = require('through2');

module.exports = function() {
    return through.obj(function(file, encoding, callback) {
        let sourceCode = file.contents.toString();

        sourceCode = sourceCode.split('\n').filter(line => {
            return line.indexOf('.debugLabel = ') === -1;
        }).join('\n');

        file.contents = new Buffer(sourceCode);
        callback(null, file);
    });
};
