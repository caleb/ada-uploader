/* jshint esnext:true, browserify:true, devel:true, browser:true */
"use strict";

import Config from 'utils/config';
import AdaUploader from 'index';

window.createUploader = function(id) {
  let config = new Config("http://localhost:4200/example/files.json");
  let uploader = new AdaUploader(config);
};
