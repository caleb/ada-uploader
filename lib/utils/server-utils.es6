var RSVP = require('rsvp');
var url = require('url');
var FileUploader = require('./file-uploader');
var MediaStore = require('../stores/media-store');

module.exports = {
  createMedia: function(config, token, file, progressCallback) {
    let media = MediaStore.get(config, token);

    return new RSVP.Promise(function(resolve, reject) {
      config.getCreateUrl().then(function(url) {
        let fileUploader = new FileUploader(file, {
          fileParam: config.getFileUploadParamName(media),
          formData: config.getUploadFormFields(media),
          url: url
        });

        if (progressCallback) {
          fileUploader.on('progress', progressCallback);
        }

        fileUploader.on('error', function(respnseText, xhr, file) {
          reject(responseText, xhr, file);
        });

        fileUploader.on('finish', function(responseText, xhr, file) {
          resolve(responseText, xhr, file);
        });

        fileUploader.send();
      }, function(error) {
        reject(error, message);
      });
    });
  }
};
