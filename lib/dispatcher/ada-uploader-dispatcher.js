/* jshint esnext:true, browserify:true, devel:true, browser:true */
"use strict";

import { Dispatcher } from 'flux';
import assign from 'object-assign';

var AdaUploaderDispatcher = assign(new Dispatcher(), {
  dispatchAction: function(action) {
    var payload = {
      action: action
    };

    this.dispatch(payload);
  }
});

module.exports = AdaUploaderDispatcher;
