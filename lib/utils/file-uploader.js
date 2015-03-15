/* jshint esnext:true, browserify:true, devel:true, browser:true */
"use strict";

import { EventEmitter } from 'events';

class FileUploader extends EventEmitter {
  constructor(file, options) {
    let formDataObject = options.formData || {};
    let fileParamName = options.fileParam || 'file';
    let url = options.url;

    if (! options.url) {
      throw "FileUploader(): options.url must be a string";
    }

    this.formData = new FormData();
    this.file = file;

    for (let name in formDataObject) {
      this.formData.append(name, formDataObject[name]);
    }

    this.formData.append(fileParamName, file);
  }

  send() {
    this.xhr = new XMLHttpRequest();
    this.xhr.upload.addEventListener('progress', this._onProgressHandler(), false);
    this.xhr.addEventListener('readystatechange', this._onReadyStateChangeHandler(), false);

    this.xhr.open('POST', this.url, true);

    this.emit('start', { file: this.file });
    this.xhr.send(this.formData);
  }

  _onProgressHandler() {
    return function(progress) {
      if (progress.lengthComputable) {
        let percent = progress.loaded / progress.total * 100;
        this.emit('percentComplete', { percentComplete: percent, progress: progress, file: this.file });
      }
    }.bind(this);
  }

  _onReadyStateChangeHandler() {
    return function(event) {
      var status = null;

      if (event.target.readyState != 4) { return; }

      try {
        status = event.target.status;
      } catch(error) {
        return;
      }

      var acceptableStatuses = [200, 201];
      var acceptableStatus = acceptableStatuses.indexOf(status) >= 0;

      if (status > 0 && !acceptableStatus) {
        this.emit('error', { responseText: event.target.responseText, xhr: event.target, file: this.file });
      }

      if (acceptableStatus && event.target.responseText && ! this.responded) {
        this.responded = true;
        this.emit('finish', { responseText: event.target.responseText, xhr: event.target, file: this.file });
      }
    }.bind(this);
  }
}

module.exports = FileUploader;
