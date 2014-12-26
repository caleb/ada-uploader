var Dispatcher = require('../dispatcher/media-organizer-dispatcher');
var Constants = require('../constants/media-constants');
var Immutable = require('immutable');
var EventEmitter = require('events').EventEmitter;

let media = Immutable.Map({});
let currentMedia = Immutable.Map({});

function createMedia(config, token, mediaObject) {
  media = media.setIn([config, token], Immutable.fromJS(mediaObject));
}

function updateMedia(config, token, mediaObject) {
  media = media.mergeDeepIn([config, token], Immutable.fromJS(mediaObject));
}

function updateMediaUploadProgress(config, token, mediaObject) {
  media = media.setIn([config, token, '_meta', 'percentComplete'], mediaObject._meta.percentComplete);
}

function mediaClicked(config, token) {
  currentMedia.set(config, media.getIn([config, token]));
}

function deleteMedia(config, token) {
  media = media.deleteIn([config, token]);
}

class MediaStore extends EventEmitter {
  constructor() {
    this.dispatchToken = Dispatcher.register(this._handleEvent.bind(this));
  }

  get(config, token) {
    return media.getIn([config, token]);
  }

  getCurrent(config) {
    return currentMedia.get(config);
  }

  emitChange() {
    this.emit('change');
  }

  _handleEvent(payload) {
    switch(payload.type) {
    case Constants.CREATE_MEDIA_PENDING:
      createMedia(payload.config, payload.token, payload.media);
      this.emitChange();
      break;
    case Constants.CREATE_MEDIA_PROGRESS:
      updateMediaUploadProgress(payload.config, payload.token, payload.media);
      this.emitChange();
      break;
    case Constants.CREATE_MEDIA_COMPLETE:
      updateMedia(payload.config, payload.token, payload.media);
      this.emitChange();
      break;
    case Constants.CREATE_MEDIA_ERROR:
      updateMedia(payload.config, payload.token, payload.media);
      this.emitChange();
      break;
    case Constants.MEDIA_CLICKED:
      mediaClicked(payload.config, payload.token);
      this.emitChange();
      break;
    }
  }
}

module.exports = MediaStore;
