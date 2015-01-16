/* jshint esnext:true, browserify:true, devel:true, browser:true */
"use strict";

var url            = require('url');
var _              = require('lodash');
var halfred        = require('halfred');
var RSVP           = require('rsvp');
var React          = require('react');
var reqwest        = require('reqwest');
var FileComponent = require('../components/file-component');

class Config {
  constructor(fileCollectionOrUrl, options) {
    this.fileCollectionOrUrl    = fileCollectionOrUrl;
    this.collectionRelation     = options.collectionRelation     || ['collection', 'self'];
    this.collectionRelationName = options.collectionRelationName || 'file';
    this.fileRelation           = options.fileRelation           || 'ada-uploader:file';
    this.acceptedTypes          = options.acceptedTypes          || [/video\/.*/, /image\/.*/];
    this.fileCreateParamName    = options.fileCreateParamName    || 'file';
  }

  getFilesCollection() {
    if (this.fileCollection) {
      return RSVP.resolve(this.fileCollection);
    } else if (_.isObject(this.fileCollectionOrUrl)) {
      this.fileCollection = halfred.parse(this.fileCollectionOrUrl);
      return RSVP.resolve(this.fileCollection);
    } else if (_.isString(this.fileCollectionOrUrl)) {
      return reqwest({
        headers: {
          Accept: 'application/hal+json'
        },
        type: 'json',
        url: this.fileCollectionOrUrl
      }).then(function(value) {
        this.fileCollection = halfred.parse(value);
        return this.fileCollection;
      }.bind(this));
    } else {
      console.log('fileCollectionOrUrl must be an object or a url');
      return RSVP.resolve(null);
    }
  }

  _filesCollectionLink(collection) {
    let collectionRelation;
    if (_.isString(this.collectionRelation)) {
      collectionRelation = [this.collectionRelation];
    } else {
      collectionRelation = this.collectionRelation;
    }

    for (let i = 0; i < collectionRelation.length; i++) {
      let linkArray = collection.linkArray(collectionRelation[i]);
      if (! linkArray) { return null; }

      if (linkArray.length == 1) {
        return linkArray[0];
      } else {
        for (let j = 0; j < linkArray.length; ++j) {
          if (linkArray[i].name == this.collectionRelationName) {
            return linkArray[i];
          }
        }
      }
    }

    return null;
  }

  ///////////
  /// API ///
  ///////////

  /*
   * Returns an array of file objects for this collection if there are preloaded
   * objects.
   *
   * Returns a promise
   */
  getFiles() {
    return this.getFilesCollection().then(function(fileCollection) {
      let embedded = fileCollection.embeddedResourceArray(this.fileRelation);

      if (embedded.length > 0) {
        return embedded;
      } else {
        // if there aren't any embedded file resources, try looking at the 'start' or 'first'
        // relations as this might be a paginated resource
        let link;

        let startLink = fileCollection.link('start');
        let firstLink = fileCollection.link('first');

        link = startLink || firstLink;

        if (! link) {
          return RSVP.reject('Couldn\'t find either a start or first relation from which to fetch the file from.');
        }

        return reqwest({
          headers: {
            Accept: 'application/hal+json'
          },
          type: 'json',
          url: link.href
        }).then(function(value) {
          return halfred.parse(value).embeddedResourceArray(this.fileRelation);
        }.bind(this), function(error) {
          return RSVP.reject(`There was an error fetching the preloaded file from the server: #{error}`);
        }.bind(this));
      }
    }.bind(this));
  }

  /*
   * Return the url to retrieve the file objects from.
   *
   * Returns a promise
   */
  getFilesCollectionUrl() {
    return this.getCreateUrl();
  }

  /*
   * Returns the url to use to create file objects.
   *
   * Returns a promise
   */
  getFilesCreateUrl() {
    return this.getFilesCollection().then(function(fileCollection) {
      return this._filesCollectionLink(fileCollection);
    }.bind(this));
  }

  /*
   * Returns the parameter name to use when uploading files to the server.
   *
   * For example: `file`
   */
  getFileCreateParamName(file) {
    return this.fileCreateParamName;
  }

  /*
   * Returns the URL for the given file object.
   *
   * Returns a promise
   */
  getFileUrl(file) {
    return RSVP.resolve(file.link('self').href);
  }

  /*
   * Returns the url to use when updating the given file object.
   *
   * Returns a promise
   */
  getFileUpdateUrl(file) {
    return this.getFileUrl(file);
  }

  /*
   * Parses the response from the server from POSTing to the create url and
   * returns the object representing the file.
   *
   * Returns an object that will be stored in the file store
   */
  parseCreateResponse(responseText) {
    return halfred.parse(responseText);
  }

  /*
   * Returns an object of field => value pairs that will be merged into the
   * FormData sent to the server when a file object is created.
   *
   * By default this method includes rails' csrf-token.
   */
  getCreateFormFields(file) {
    var csrfParamTag = document.querySelectorAll('meta[name=csrf-param]');
    let csrfParam = null;
    if (csrfParamTag) {
      csrfParam = csrfParamTag.getAttribute('content');
    }

    var csrfTokenTag = document.querySelectorAll('meta[name=csrf-token]');
    let csrfToken = null;
    if (csrfTokenTag) {
      csrfToken = csrfTokenTag.getAttribute('content');
    }

    let fields = {};

    if (csrfParam && csrfToken) {
      fields[csrfParam] = csrfToken;
    }

    return fields;
  }

  /*
   * Builds a file component (a React component) from the passed in file.
   */
  buildFileComponent(file) {
    return React.createElement(FileComponent, { file: file, key: file._meta.token });
  }
}

module.exports = Config;
