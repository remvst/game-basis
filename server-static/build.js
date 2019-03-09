'use strict';

const gulp = require('gulp');
const concat = require('gulp-concat');
const minify = require('gulp-minify');
const browserify = require('gulp-browserify');
const babel = require('gulp-babel');
const rename = require('gulp-rename');
const hashFiles = require('hash-files');
const uglifyJS = require('gulp-uglify');

const prepend = require('./gulp-prepend');
const removeDebugLabels = require('./gulp-remove-debug-labels');

const buildPath = __dirname + '/../build/';

const libs = [
    __dirname + '/../client/lib/font.js',
    __dirname + '/../client/lib/pegasus.js'
];

module.exports.debug = () => {
    return gulp
        .src(__dirname + '/../client/js/main.js')
        .pipe(browserify())
        .pipe(concat('debug.js'))
        .pipe(gulp.dest(buildPath));
};

module.exports.minified = () => {
    return module.exports.debug()
        .pipe(rename('minified.js'))
        .pipe(babel({
            'presets': ['es2015'],
            'compact': true
        }))
        .pipe(minify({
            'ext': {'min': '.js'},
            'mangle': true
        }))
        .pipe(uglifyJS())
        .pipe(gulp.dest(buildPath));
};

module.exports.libs = () => {
    return gulp
        .src(libs)
        .pipe(concat('libs.js'))
        .pipe(minify({
            'ext': {'min': '.min.js'},
            'mangle': true
        }))
        .pipe(gulp.dest(buildPath));
};

function prependHash() {
    return prepend(callback => {
        hashFiles({
            'files': ['./client/js/**/*.js'],
            'algorithm': 'sha1'
        }, (error, hash) => {
            const prefix = '// Hash: ' + hash + '\n';
            if (hash) {
                callback(prefix);
            }
        });
    });
}

module.exports.bundle = () => {
    return gulp
        .src([buildPath + 'libs.min.js', buildPath + 'minified.js'])
        .pipe(concat('bundle-main.js'))
        .pipe(prependHash())
        .pipe(gulp.dest(buildPath));
};
