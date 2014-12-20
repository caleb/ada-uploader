var fastBrowserify = require('broccoli-fast-browserify');
var to5 = require('broccoli-6to5-transpiler');
var funnel = require('broccoli-funnel');

to5.prototype.extensions = ['es6'];

var javascriptFiles = new funnel('lib', { include: [/(?:\.js)|(?:\.es6)$/] });
var es6Tree = to5(javascriptFiles);

module.exports = fastBrowserify(es6Tree, {
  bundles: {
    'media-organizer.js': {
      entryPoints: ['index.js']
    }
  }
});
