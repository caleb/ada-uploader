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
        _meta: {
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
      response = config.parseCreateResponse(reponseText);

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
            error: error,
            status: Constants.MEDIA_ERROR
          }
        }
      };

      Dispatcher.dispatchAction(payload);
    });
  }
};
