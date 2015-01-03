/* jshint esnext:true, browserify:true */
"use strict";

var _           = require('lodash');
var Dispatcher  = require('../dispatcher/media-organizer-dispatcher');
var ServerUtils = require('../utils/server-utils');
var Constants   = require('../constants/media-constants');

module.exports = {
  createMedia: function(config, file) {
    var token = _.uniqueId('media_');
    var payload = {
      token: token,
      type: Constants.CREATE_MEDIA_PENDING,
      config: config,
      media: {
        _meta: {
          token: token,
          mimeType: file.type,
          name: file.name,
          lastModifiedTime: file.lastModifiedDate,
          size: file.size,
          status: Constants.MEDIA_PENDING
        }
      }
    };

    Dispatcher.dispatchAction(payload);
    ServerUtils.createMedia(config, token, file, function(response) {
      // on upload progress
      payload = {
        token: token,
        config: config,
        type: Constants.CREATE_MEDIA_PROGRESS,
        media: {
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
        type: Constants.CREATE_MEDIA_COMPLETE,
        media: _.merge({
          _meta: {
            status: Constants.MEDIA_COMPLETE
          }
        }, response)
      };

      Dispatcher.dispatchAction(payload);
    }, function(responseText, xhr, file) {
      payload = {
        token: token,
        config: config,
        type: Constants.CREATE_MEDIA_ERROR,
        media: {
          _meta: {
            error: responseText,
            status: Constants.MEDIA_ERROR
          }
        }
      };

      Dispatcher.dispatchAction(payload);
    });
  },

  loadFromConfig: function(config) {
    // preloads the store from a configuration object
    config.getPreloadedMedia().then(function(media) {
      // add a token to each preloaded media
      media.forEach(function(media) {
        let token = _.uniqueId('media_');
        media._meta = media._meta || {};
        media._meta.token = token;
      });

      var payload = {
        type: Constants.LOAD_FROM_CONFIG,
        config: config,
        media: media
      };
      Dispatcher.dispatchAction(payload);
    });
  }
};
