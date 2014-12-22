var RSVP = require('rsvp');
var url = require('url');
var FileUploader = require('./file-uploader');
var MediaStore = require('../stores/media-store');

module.exports = {
  createMedia: function(config, token, progressCallback) {
    var media = MediaStore.get(token);
    var file = media.file;

    return new RSVP.Promise(function(succeed, fail) {
      let fileUploader = new FileUploader(file, {
        fileParam: config.getFileUploadParamName(file),
        formData: config.getUploadFormFields(file),
        url: config.getCollectionUrl(file)
      });

      if (progressCallback) {
        fileUploader.on('progress', function(progress) {
          progressCallback(progress);
        });
      }

      fileUploader.on('error', function(result) {
        fail(result);
      });

      fileUploader.on('finish', function(result) {
        succeed(result);
      });

      fileUploader.send();
    });
  }
};
