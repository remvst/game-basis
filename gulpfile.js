'use strict';

const gulp = require('gulp');
const build = require('./server-static/build');

gulp.task('debug', () => build.debug());
gulp.task('mangled', () => build.mangled());
gulp.task('minified', () => build.minified());

gulp.task('libs', () => build.libs());

gulp.task('default', ['libs', 'minified'], () => build.bundle());
