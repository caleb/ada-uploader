/* jshint esnext:true, browserify:true */
"use strict";

var url            = require('url');
var _              = require('lodash');
var halfred        = require('halfred');
var RSVP           = require('rsvp');
var React          = require('react');
var reqwest        = require('reqwest');
var MediaComponent = require('../components/media-component');

class Config {
  constructor(mediaCollectionOrUrl, options) {
    this.mediaCollectionOrUrl   = mediaCollectionOrUrl;
    this.collectionRelation     = options.collectionRelation     || ['collection', 'self'];
    this.collectionRelationName = options.collectionRelationName || 'media';
    this.mediaRelation          = options.mediaRelation          || 'media-organizer:media';
    this.acceptedTypes          = options.acceptedTypes          || [/video\/.*/, /image\/.*/];
    this.fileCreateParamName    = options.fileCreateParamName    || 'file';
  }

  getMediaCollection() {
    if (this.mediaCollection) {
      return RSVP.resolve(this.mediaCollection);
    } else if (_.isObject(this.mediaCollectionOrUrl)) {
      this.mediaCollection = halfred.parse(this.mediaCollectionOrUrl);
      return RSVP.resolve(this.mediaCollection);
    } else if (_.isString(this.mediaCollectionOrUrl)) {
      return reqwest({
        headers: {
          Accept: 'application/hal+json'
        },
        type: 'json',
        url: this.mediaCollectionOrUrl
      }).then(function(value) {
        this.mediaCollection = halfred.parse(value);
        return this.mediaCollection;
      }.bind(this));
    } else {
      console.log('mediaCollectionOrUrl must be an object or a url');
      return RSVP.resolve(null);
    }
  }

  getMediaCollectionUrl(collection) {
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
  }

  ///////////
  /// API ///
  ///////////

  /*
   * Returns an array of media objects for this collection if there are preloaded
   * objects.
   *
   * Returns a promise
   */
  getMedia() {
    return this.getMediaCollection().then(function(mediaCollection) {
      let embedded = mediaCollection.embeddedResourceArray(this.mediaRelation);

      if (embedded.length > 0) {
        return embedded;
      } else {
        // if there aren't any embedded media resources, try looking at the 'start' or 'first'
        // relations as this might be a paginated resource
        let link;

        let startLink = mediaCollection.link('start');
        let firstLink = mediaCollection.link('first');

        link = startLink || firstLink;

        if (! link) {
          return RSVP.reject('Couldn\'t find either a start or first relation from which to fetch the media from.');
        }

        return reqwest({
          headers: {
            Accept: 'application/hal+json'
          },
          type: 'json',
          url: link.href
        }).then(function(value) {
          return halfred.parse(value).embeddedResourceArray(this.mediaRelation);
        }.bind(this), function(error) {
          return RSVP.reject(`There was an error fetching the preloaded media from the server: #{error}`);
        }.bind(this));
      }
    }.bind(this));
  }

  /*
   * Return the url to retrieve the media objects from.
   *
   * Returns a promise
   */
  getMediaCollectionUrl() {
    return this.getCreateUrl();
  }

  /*
   * Returns the url to use to create media objects.
   *
   * Returns a promise
   */
  getCreateUrl() {
    return this.getMediaCollection().then(function(mediaCollection) {
      return this.getMediaCollectionUrl(mediaCollection);
    }.bind(this));
  }

  /*
   * Returns the parameter name to use when uploading files to the server.
   *
   * For example: `file`
   */
  getFileCreateParamName(media) {
    return this.fileCreateParamName;
  }

  /*
   * Returns the URL for the given media object.
   *
   * Returns a promise
   */
  getMediaUrl(media) {
    return RSVP.resolve(media.link('self').href);
  }

  /*
   * Returns the url to use when updating the given media object.
   *
   * Returns a promise
   */
  getMediaUpdateUrl(media) {
    return this.getMediaUrl(media);
  }

  /*
   * Parses the response from the server from POSTing to the create url and
   * returns the object representing the media.
   *
   * Returns an object that will be stored in the media store
   */
  parseCreateResponse(responseText) {
    return halfred.parse(responseText);
  }

  /*
   * Returns an object of field => value pairs that will be merged into the
   * FormData sent to the server when a media object is created.
   *
   * By default this method includes rails' csrf-token.
   */
  getCreateFormFields(media) {
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
   * Builds a media component (a React component) from the passed in media.
   */
  buildMediaComponent(media) {
    return React.createElement(MediaComponent, { media: media, key: media._meta.token });
  }
}

module.exports = Config;
