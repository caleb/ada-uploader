var fastBrowserify = require('broccoli-fast-browserify');
var to5            = require('broccoli-6to5-transpiler');
var funnel         = require('broccoli-funnel');
var uglify         = require('broccoli-uglify-js');
var react          = require('broccoli-react');
var merge          = require('broccoli-merge-trees');

to5.prototype.extensions = ['es6', 'js'];

function stripExtension(tree) {
  return new funnel(tree, {
    getDestinationPath: function(relativePath) {
      return relativePath.replace(/\.[^.]+$/, '');
    }
  });
}

var javascriptFiles = new funnel('lib', { include: [/(?:\.js|\.es6)$/] });
var reactFiles = react(new funnel('lib', { include: [/\.jsx$/] }));
reactFiles = stripExtension(reactFiles);

var es6Tree = to5(merge([javascriptFiles, reactFiles]), {
  sourceMap: 'inline'
});

var bundle = fastBrowserify(es6Tree, {
  // mark 'vertx' as external because RSVP has a require for it, which browserify
  // picks up on, but `vertx` isn't actually a module we can include
  // this has been fixed in RSVP@HEAD but not in the release version
  // (Sat Dec 27 02:02:02 2014)
  externals: ['vertx'],

  browserify: {
    debug: true
  },

  bundles: {
    'ada-uploader.js': {
      entryPoints: ['index.js']
    }
  }
});

var ugly = new funnel(uglify(bundle), {
  getDestinationPath: function(relativePath) {
    return relativePath.replace(/\.js/, '.min.js');
  }
});

module.exports = merge([ugly, bundle]);
