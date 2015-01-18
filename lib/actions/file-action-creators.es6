/* jshint esnext:true, browserify:true, devel:true, browser:true */
"use strict";

var _           = require('lodash');
var Dispatcher  = require('../dispatcher/ada-uploader-dispatcher');
var ServerUtils = require('../utils/server-utils');
var Constants   = require('../constants/file-constants');

module.exports = {
  createFile: function(config, file) {
    var token = _.uniqueId('file_');
    var payload = {
      token: token,
      type: Constants.CREATE_FILE_PENDING,
      config: config,
      file: {
        _meta: {
          token: token,
          mimeType: file.type,
          name: file.name,
          lastModifiedTime: file.lastModifiedDate,
          size: file.size,
          status: Constants.FILE_PENDING
        }
      }
    };

    Dispatcher.dispatchAction(payload);
    ServerUtils.createFile(config, token, file, function(response) {
      // on upload progress
      payload = {
        token: token,
        config: config,
        type: Constants.CREATE_FILE_PROGRESS,
        file: {
          _meta: {
            percentComplete: response.percentComplete,
            progress: response.progress
          }
        }
      };

      Dispatcher.dispatchAction(payload);
    }).then(function(responseText, xhr, file) {
      let response = config.parseCreateResponse(responseText);

      payload = {
        token: token,
        config: config,
        type: Constants.CREATE_FILE_COMPLETE,
        file: _.merge({
          _meta: {
            status: Constants.FILE_COMPLETE
          }
        }, response)
      };

      Dispatcher.dispatchAction(payload);
    }, function(responseText, xhr, file) {
      payload = {
        token: token,
        config: config,
        type: Constants.CREATE_FILE_ERROR,
        file: {
          _meta: {
            error: responseText,
            status: Constants.FILE_ERROR
          }
        }
      };

      Dispatcher.dispatchAction(payload);
    });
  },

  loadFromConfig: function(config) {
    // preloads the store from a configuration object
    config.getFiles().then(function(files) {
      // add a token to each preloaded file
      files.forEach(function(file) {
        let token = _.uniqueId('file_');
        file._meta = file._meta || {};
        file._meta.token = token;
      });

      var payload = {
        type: Constants.LOAD_FROM_CONFIG,
        config: config,
        files: files
      };
      Dispatcher.dispatchAction(payload);
    });
  }
};
