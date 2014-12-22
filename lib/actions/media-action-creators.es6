var Dispatcher = require('../dispatcher/media-organizer-dispatcher');
var ServerUtils = require('../utils/server-utils');
var fauxDash = require('../utils/faux-dash');
var Constants = require('../constants/media-constants');

module.exports = {
  createMedia: function(config, file) {
    var token = fauxDash.uniqueId('media_');
    var payload = {
      token: token,
      type: Constants.CREATE_MEDIA_PENDING,
      file: file
    };

    Dispatcher.dispatchAction(payload);
    ServerUtils.createMedia(config, token, function(response) {
      // on upload progress
      payload = {
        token: token,
        type: Constants.CREATE_MEDIA_PROGRESS,
        percentComplete: response.percentComplete,
        progress: response.progress
      };

      Dispatcher.dispatchAction(payload);
    }).then(function(response) {
      payload = {
        token: token,
        type: Constants.CREATE_MEDIA_COMPLETE,
        response: response
      };
      Dispatcher.dispatchAction(payload);
    }).catch(function(error) {
      payload = {
        token: token,
        type: Constants.CREATE_MEDIA_ERROR,
        response: error
      };
      Dispatcher.dispatchAction(payload);
    });
  }
};
