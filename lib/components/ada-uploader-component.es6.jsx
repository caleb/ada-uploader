/* jshint esnext:true, browserify:true, devel:true, browser:true */
"use strict";

/*
 * This is the top level React component responsible for rendering the collection.
 */

var React          = require('react');
var ActionCreators = require('../actions/file-action-creators');
var FileStore     = require('../stores/file-store');
var Constants      = require('../constants/file-constants');

var AdaUploaderComponent = React.createClass({
  getInitialState: function() {
    return { file: [] };
  },

  componentWillMount: function() {
    FileStore.on(Constants.FILE_CHANGE, this.fileUpdated.bind(this));
  },

  componentDidMount: function() {
  },

  fileUpdated: function() {
    // fetch all of the file for this configuration
    let file = FileStore.get(this.props.config);
    this.setState({ file: file });
  },

  render: function() {
    let fileObjects = _.map(this.getState.file, this.props.config.buildFileComponent);

    return (
      <div>
        {fileObjects}
      </div>
    );
  }
});

module.exports = AdaUploaderComponent;
