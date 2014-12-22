var http = require('http');
var RSVP = require('rsvp');

module.exports = {
  createPhoto: function(config, file, progressCallback) {
    return RSVP.Promise(function(succeed, fail) {
      var options = {
        method: 'PUT',
        path: config.photosPath
      };
      var request = http.request(options, function(response) {
        if (response.statusCode != 200) {
          var data = "";
          response.on('data', function(chunk) {
            data += chunk;
          });
          response.on('end', function() {
            var object = JSON.parse(data);
            succeed(object);
          });
        } else {
          fail(response);
        }
      });
      request.on('error', function(e) {
        fail(e);
      });

      var formData = new FormData();
      request.write(formData);
      request.end();
    });
  }
};
