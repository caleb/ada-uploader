var EventEmitter = require('events').EventEmitter;

class FileUploader extends EventEmitter {
  constructor(file, options) {
    let formDataObject = options.formData || {};
    let fileParamName = options.fileParam || 'file';
    let url = options.url;

    if (! options.url) {
      throw "FileUploader(): options.url must be a string";
    }

    this.formData = new FormData();

    for (let name in formDataObject) {
      this.formData.append(name, formDataObject[name]);
    }

    this.formData.append(fileParamName, file);
  }

  send() {
    this.xhr = new XMLHttpRequest();
    this.xhr.upload.addEventListener('progress', this._onProgressHandler(file), false);
    this.xhr.addEventListener('readystatechange', this._onReadyStateChangeHandler(file), false);

    this.xhr.open('POST', this.url, true);

    this.emit('start', { file: file });
    this.xhr.send(this.formData);
  }

  _onProgressHandler(file) {
    return function(progress) {
      if (progress.lengthComputable) {
        percent = progress.loaded / progress.total * 100;
        this.emit('percentComplete', { percentComplete: percent, progress: progress, file: file });
      }
    }.bind(this);
  }

  _onReadyStateChangeHandler(file) {
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
        this.emit('error', { responseText: event.target.responseText, event: event, file: file });
      }

      if (acceptableStatus && event.target.responseText && ! this.responded) {
        this.responded = true;
        this.emit('finish', { responseText: event.target.responseText, event: event, file: file });
      }
    }.bind(this);
  }
}

module.exports = FileUploader;
