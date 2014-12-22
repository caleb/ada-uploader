// https://github.com/thoughtbot/jack_up/blob/use_form_data/lib/assets/javascripts/jack_up/file_uploader.coffee

function onProgressHandler(file) {
  return function(progress) {
    if (progress.lengthComputable) {
      percent = progress.loaded / progress.total * 100;
      this.trigger('upload:percentComplete', { percentComplete: percent, progress: progress, file: file });

      if (percent == 100) {
        this.trigger('upload:sentToServer', { file: file });
      }
    }
  };
}

function _onReadyStateChangeHandler(file) {
  return function(event) {
    var status = null
    if (event.target.readyState != 4) {
      return;
    }

    try{
      status = event.target.status;
    } catch(error) {
      return;
    }

    var acceptableStatuses = [200, 201];
    var acceptableStatus = acceptableStatuses.indexOf(status) >= 0;

    if (status > 0 && !acceptableStatus) {
      this.trigger('upload:failure', { responseText: event.target.responseText, event: event, file: file });
    }


    if (acceptableStatus && event.target.responseText && !@responded) {
      this.responded = true;
      this.trigger('upload:success', { responseText: event.target.responseText, event: event, file: file });
    }
  };
}


module.exports = {
  uploadFile: function(options, file) {
    xhr = new XMLHttpRequest();
    xhr.upload.addEventListener('progress', this._onProgressHandler(file), false);
    xhr.addEventListener('readystatechange', this._onReadyStateChangeHandler(file), false);

    xhr.open( 'POST', this.path, true);

    formData = railsFormData();
    formData.append(this.fileParam, file);

    this.trigger('upload:start', { file: file });
    xhr.send(formData);
  }
};
