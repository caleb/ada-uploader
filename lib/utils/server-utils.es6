/* jshint esnext:true, browserify:true, devel:true, browser:true */
"use strict";

var RSVP = require('rsvp');
var url = require('url');
var FileUploader = require('./file-uploader');
var FileStore = require('../stores/file-store');

module.exports = {
  createFile: function(config, token, fileBlob, progressCallback) {
    let file = FileStore.get(config, token);

    return new RSVP.Promise(function(resolve, reject) {
      config.getCreateUrl().then(function(url) {
        let fileUploader = new FileUploader(fileBlob, {
          fileParam: config.getFileUploadParamName(file),
          formData: config.getUploadFormFields(file),
          url: url
        });

        if (progressCallback) {
          fileUploader.on('progress', progressCallback);
        }

        fileUploader.on('error', function(responseText, xhr, file) {
          reject(responseText, xhr, file);
        });

        fileUploader.on('finish', function(responseText, xhr, file) {
          resolve(responseText, xhr, file);
        });

        fileUploader.send();
      }, function(error) {
        reject(error);
      });
    });
  }
};
