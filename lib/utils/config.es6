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
  getCollectionUrl() {
    return this.getCreateUrl();
  }

  getCreateUrl() {
    return this.getMediaOwner().then(function(owner) {
      return owner.link(this.mediaRelation).href;
    }.bind(this));
  }

  getFileCreateParamName(media) {
    return this.fileCreateParamName;
  }

  getMediaUrl(media) {
    return RSVP.resolve(media.link('self').href);
  }

  getMediaUpdateUrl(media) {
    return this.getMediaUrl(media);
  }

  ///////////////////////////////////////////////////////////////////////////////////////////
  /// Return an object of key value pairs to include in the FormData when creating media ///
  ///////////////////////////////////////////////////////////////////////////////////////////
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
