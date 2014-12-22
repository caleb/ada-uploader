var fastBrowserify = require('broccoli-fast-browserify');
var to5            = require('broccoli-6to5-transpiler');
var funnel         = require('broccoli-funnel');
var uglify         = require('broccoli-uglify-js');
var merge          = require('broccoli-merge-trees');

to5.prototype.extensions = ['es6'];

var javascriptFiles = new funnel('lib', { include: [/(?:\.js)|(?:\.es6)$/] });
var es6Tree = to5(javascriptFiles, {
  sourceMap: 'inline'
});

var bundle = fastBrowserify(es6Tree, {
  browserify: {
    debug: true
  },

  bundles: {
    'media-organizer.js': {
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
