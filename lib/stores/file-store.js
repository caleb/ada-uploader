/* jshint esnext:true, browserify:true, devel:true, browser:true */
"use strict";

import Dispatcher from '../dispatcher/ada-uploader-dispatcher';
import Constants from '../constants/file-constants';
import Immutable from 'immutable';
import { EventEmitter } from 'events';

let file = Immutable.Map({});
let currentFile = Immutable.Map({});

function loadFromConfig(config, files) {
  files.forEach(function(file) {
    file.setIn([config, file._meta.token], Immutable.fromJS(file));
  });
}

function createFile(config, token, fileObject) {
  file = file.setIn([config, token], Immutable.fromJS(fileObject));
}

function updateFile(config, token, fileObject) {
  file = file.mergeDeepIn([config, token], Immutable.fromJS(fileObject));
}

function updateFileUploadProgress(config, token, fileObject) {
  file = file.setIn([config, token, '_meta', 'percentComplete'], fileObject._meta.percentComplete);
}

function fileClicked(config, token) {
  currentFile.set(config, file.getIn([config, token]));
}

function deleteFile(config, token) {
  file = file.deleteIn([config, token]);
}

class FileStore extends EventEmitter {
  constructor() {
    this.dispatchToken = Dispatcher.register(this._handleEvent.bind(this));
  }

  get(config, token) {
    return file.getIn([config, token]);
  }

  getCurrent(config) {
    return currentFile.get(config);
  }

  emitChange() {
    this.emit('change');
  }

  _handleEvent(payload) {
    switch(payload.type) {
    case Constants.LOAD_FROM_CONFIG:
      loadFromConfig(payload.config, payload.files);
      this.emitChange();
      break;
    case Constants.CREATE_FILE_PENDING:
      createFile(payload.config, payload.token, payload.file);
      this.emitChange();
      break;
    case Constants.CREATE_FILE_PROGRESS:
      updateFileUploadProgress(payload.config, payload.token, payload.file);
      this.emitChange();
      break;
    case Constants.CREATE_FILE_COMPLETE:
      updateFile(payload.config, payload.token, payload.file);
      this.emitChange();
      break;
    case Constants.CREATE_FILE_ERROR:
      updateFile(payload.config, payload.token, payload.file);
      this.emitChange();
      break;
    case Constants.FILE_CLICKED:
      fileClicked(payload.config, payload.token);
      this.emitChange();
      break;
    }
  }
}

module.exports = FileStore;
