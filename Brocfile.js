/* jshint esnext:true, browserify:true, devel:true, browser:true */
"use strict";

var browserify = require('broccoli-fast-browserify');
var babelify   = require('babelify');
var funnel     = require('broccoli-funnel');
var uglify     = require('broccoli-uglify-js');
var merge      = require('broccoli-merge-trees');

var javascriptFiles = new funnel('lib', { include: [/(?:\.js|\.jsx)$/] });

var bundle = browserify(javascriptFiles, {
  // mark 'vertx' as external because RSVP has a require for it, which browserify
  // picks up on, but `vertx` isn't actually a module we can include
  // this has been fixed in RSVP@HEAD but not in the release version
  // (Sat Dec 27 02:02:02 2014)
  externals: ['vertx'],

  browserify: {
    debug: true,
    extensions: ['.jsx']
  },

  bundles: {
    'ada-uploader.js': {
      entryPoints: ['index.js'],
      transform: babelify
    }
  }
});

var ugly = new funnel(uglify(bundle), {
  getDestinationPath: function(relativePath) {
    return relativePath.replace(/\.js/, '.min.js');
  }
});

var exampleFiles = new funnel('example', { include: [/(?:\.html|\.css|\.json)$/], destDir: 'example' });
var exampleJavascriptFiles = new funnel('example', { include: [/(?:\.js|\.jsx)$/], destDir: 'example' });
var exampleBundle = browserify(exampleJavascriptFiles, {
  browserify: {
    debug: true,
    extensions: ['.jsx'],
    paths: [
      __dirname + '/lib'
    ]
  },

  bundles: {
    'example/application.js': {
      entryPoints: ['example/application.jsx'],
      transform: babelify
    }
  }
});

module.exports = merge([ugly, bundle, exampleFiles, exampleBundle]);
