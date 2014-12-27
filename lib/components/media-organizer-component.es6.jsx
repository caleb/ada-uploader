/* jshint esnext:true, browserify:true */
"use strict";

/*
 * This is the top level React component responsible for rendering the collection.
 */

var React = require('react');
var ActionCreators = require('../actions/media-action-creators');
var MediaStore = require('../stores/media-store');
var Constants = require('../constants/media-constants');

var MediaOrganizerComponent = React.createClass({
  getInitialState: function() {
    return { media: [] };
  },

  componentWillMount: function() {
    MediaStore.on(Constants.MEDIA_CHANGE, this.mediaUpdated.bind(this));
  },

  componentDidMount: function() {
  },

  mediaUpdated: function() {
    // fetch all of the media for this configuration
    let media = MediaStore.get(this.props.config);
    this.setState({ media: media });
  },

  render: function() {
    return (
      <div>
      </div>
    );
  }
});

module.exports = MediaOrganizerComponent;
