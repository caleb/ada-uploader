var Dispatcher = require('../dispatcher/media-organizer-dispatcher');
var ServerUtils = require('../utils/server-utils');
var Constants = require('../constants/media-constants');
var _ = require('lodash');

module.exports = {
  createPhoto: function(config, file) {
    var uniqueId = _.uniqueId('photo_');
    var payload = {
      token: uniqueId,
      type: Constants.CREATE_PHOTO_PENDING,
      file: file
    };

    Dispatcher.dispatchAction(payload);
    ServerUtils.createPhoto(config, file, function(response) {
      // on upload progress
      payload = {
        token: uniqueId,
        type: Constants.CREATE_PHOTO_PROGRESS,
        response: response
      };
      Dispatcher.dispatchAction(payload);
    }).then(function(response) {
      payload = {
        token: uniqueId,
        type: Constants.CREATE_PHOTO_COMPLETE,
        response: response
      };
      Dispatcher.dispatchAction(payload);
    }).catch(function(error) {
      payload = {
        token: uniqueId,
        type: Constants.CREATE_PHOTO_ERROR,
        response: error
      };
      Dispatcher.dispatchAction(payload);
    });
  }
};
