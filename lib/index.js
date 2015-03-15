/* jshint esnext:true, browserify:true, devel:true, browser:true */
"use strict";

import Dispatcher           from './dispatcher/ada-uploader-dispatcher';
import Config               from './utils/config';
import ActionCreators       from './actions/file-action-creators';
import AdaUploaderComponent from './components/ada-uploader-component';
import _                    from 'lodash';

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
