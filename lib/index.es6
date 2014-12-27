/* jshint esnext:true, browserify:true */
"use strict";

var Dispatcher              = require('./dispatcher/media-organizer-dispatcher');
var Config                  = require('./utils/config');
var ActionCreators          = require('./actions/media-action-creators');
var MediaOrganizerComponent = require('./components/media-organizer-component');
var _                       = require('lodash');

class MediaOrganizer {
  constructor(config, options) {
    this.config = config;
    this.options = _.merge({
      // default options
    }, options);

    ActionCreators.loadFromConfig(config);
  }
}

module.exports = MediaOrganizer;
