/* jshint esnext:true, browserify:true, devel:true, browser:true */
"use strict";

var Dispatcher           = require('./dispatcher/ada-uploader-dispatcher');
var Config               = require('./utils/config');
var ActionCreators       = require('./actions/file-action-creators');
var AdaUploaderComponent = require('./components/ada-uploader-component');
var _                    = require('lodash');

class AdaUploader {
  constructor(config, options) {
    this.config = config;
    this.options = _.merge({
      // default options
    }, options);

    ActionCreators.loadFromConfig(config);
  }
}

module.exports = AdaUploader;
