var gulp = require('gulp');
var nodemon = require('gulp-nodemon');
var bs = require('browser-sync').create();

/**
 * Will listen to changes in the js files and restart the server.
 * For only the server resources
 */
gulp.task('nodemon', function (cb) {

  var started = false;

  return nodemon({
    script: 'index.js',
    ext: 'js',
    watch: ['routes/**/*.js', 'index.js'],
    ignore: ["public/*"]
  }).on('start', function () {
    // to avoid nodemon being started multiple times
    if (!started) {
      started = true;
      cb();
    }
  });
});

/**
 * Start browser sync. Livereloads any changes in the angular app.
 */
gulp.task('browser-sync', function () {
  return bs.init(null, {
    proxy: "http://localhost:" + 3000,
    files: ["views", "public/css"],
    browser: "google chrome",
    port: 7000,
    notify: true
  });
});

gulp.task('start', ['nodemon', 'browser-sync'], function () {
  console.log('Application is now running');
});