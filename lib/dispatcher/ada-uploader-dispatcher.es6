/* jshint esnext:true, browserify:true, devel:true, browser:true */
"use strict";

var Dispatcher = require('flux').Dispatcher;
var assign = require('object-assign');

var AdaUploaderDispatcher = Object.assign(new Dispatcher(), {
  dispatchAction: function(action) {
    var payload = {
      action: action
    };

    this.dispatch(payload);
  }
});

module.exports = AdaUploaderDispatcher;
