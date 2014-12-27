/* jshint esnext:true, browserify:true */
"use strict";

var url = require('url');
var _ = require('lodash');
var halfred = require('halfred');
var reqwest = require('reqwest');

class Config {
  constructor(mediaOwnerOrUrl, options) {
    this.mediaOwnerOrUrl     = mediaOwnerOrUrl;
    this.mediaRelation       = options.mediaRelation || 'media';
    this.acceptedTypes       = options.acceptedTypes || [/video\/.*/, /image\/.*/];
    this.fileCreateParamName = options.fileCreateParamName || 'file';
  }

  getMediaOwner() {
    if (this.mediaOwner) {
      return RSVP.resolve(this.mediaOwner);
    } else if (_.isObject(this.mediaOwnerOrUrl)) {
      this.mediaOwner = halfred.parse(this.mediaOwnerOrUrl);
      return RSVP.resolve(this.mediaOwner);
    } else if (_.isString(this.mediaOwnerOrUrl)) {
      return reqwest({
        headers: {
          Accept: 'application/hal+json'
        },
        type: 'json',
        url: this.mediaOwner
      }).then(function(value) {
        this.mediaOwner = halfred.parse(value);
        return this.mediaOwner;
      }.bind(this));
    } else {
      console.log('mediaOwnerOrUrl must be an object or a url');
      return RSVP.resolve(null);
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
  getPreloadedMedia() {
    return this.getMediaOwner().then(function(mediaOwner) {
      let embedded = mediaOwner.embeddedResourceArray(this.mediaRelation);
      if (embedded.length > 0) {
        return embedded;
      } else {
        let url = mediaOwner.link(this.mediaRelation).href;

        return reqwest({
          headers: {
            Accept: 'application/hal+json'
          },
          type: 'json',
          url: url
        }).then(function(value) {
          return halfred.parse(value).embeddedResourceArray(this.mediaRelation);
        }.bind(this), function(error) {
          console.log("There was an error fetching the preloaded media from the server.");
          return [];
        }.bind(this));
      }
    }.bind(this));
  }

  /*
   * Return the url to retrieve the media objects from.
   *
   * Returns a promise
   */
  getCollectionUrl() {
    return this.getCreateUrl();
  }

  /*
   * Returns the url to use to create media objects.
   *
   * Returns a promise
   */
  getCreateUrl() {
    return this.getMediaOwner().then(function(owner) {
      return owner.link(this.mediaRelation).href;
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
}

module.exports = Config;
