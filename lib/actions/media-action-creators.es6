var _ = require('lodash');
var Dispatcher = require('../dispatcher/media-organizer-dispatcher');
var ServerUtils = require('../utils/server-utils');
var Constants = require('../constants/media-constants');

module.exports = {
  createMedia: function(config, file) {
    var token = _.uniqueId('media_');
    var payload = {
      token: token,
      type: Constants.CREATE_MEDIA_PENDING,
      config: config,
      media: {
        mimeType: file.type,
        name: file.name,
        lastModifiedTime: file.lastModifiedDate,
        size: file.size,
        status: Constants.MEDIA_PENDING
      }
    };

    Dispatcher.dispatchAction(payload);
    ServerUtils.createMedia(config, token, function(response) {
      // on upload progress
      payload = {
        token: token,
        config: config,
        type: Constants.CREATE_MEDIA_PROGRESS,
        media: {
          percentComplete: response.percentComplete,
          progress: response.progress
        }
      };

      Dispatcher.dispatchAction(payload);
    }).then(function(response) {
      response = config.parseCreateResponse(response);

      payload = {
        token: token,
        config: config,
        type: Constants.CREATE_MEDIA_COMPLETE,
        media: _.merge(response, {
          status: Constants.MEDIA_COMPLETE
        })
      };
      Dispatcher.dispatchAction(payload);
    }).catch(function(error) {
      payload = {
        token: token,
        config: config,
        type: Constants.CREATE_MEDIA_ERROR,
        media: {
          error: error,
          status: Constants.MEDIA_ERROR
        }
      };
      Dispatcher.dispatchAction(payload);
    });
  }
};
