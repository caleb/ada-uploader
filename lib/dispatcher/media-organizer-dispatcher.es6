var Dispatcher = require('flux').Dispatcher;
var assign = require('object-assign');

var MediaOrganizerDispatcher = Object.assign(new Dispatcher(), {
  handleAction: function(action) {
    var payload = {
      action: action
    };

    this.dispatch(payload);
  }
});

module.exports = MediaOrganizerDispatcher;
