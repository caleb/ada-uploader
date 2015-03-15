/* jshint esnext:true, browserify:true, devel:true, browser:true */
"use strict";

/*
 * This is the top level React component responsible for rendering the collection.
 */

import React from 'react';
import ActionCreators from '../actions/file-action-creators';
import FileStore from '../stores/file-store';
import Constants from '../constants/file-constants';

var AdaUploaderComponent = React.createClass({
  getInitialState: function() {
    return { files: [] };
  },

  componentWillMount: function() {
    FileStore.on(Constants.FILE_CHANGE, this.fileUpdated.bind(this));
  },

  componentDidMount: function() {
  },

  fileUpdated: function() {
    // fetch all of the file for this configuration
    let files = FileStore.get(this.props.config);
    this.setState({ files: files });
  },

  render: function() {
    let fileObjects = _.map(this.getState.files, this.props.config.buildFileComponent);

    return (
      <div className="ada-uplader">
        {fileObjects}
      </div>
    );
  }
});

module.exports = AdaUploaderComponent;
