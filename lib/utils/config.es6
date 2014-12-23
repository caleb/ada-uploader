var url = require('url');

class Config {
  constructor(options) {
    this.protocol            = options.protocol || window.location.protocol;
    this.hostName            = options.hostName || window.location.host;
    this.port                = options.port || window.location.port;
    this.acceptedTypes       = options.acceptedTypes || [/video\/.*/, /image\/.*/];
    this.collectionPath      = options.collectionPath;
    this.createQueryParams   = options.createQueryParams;
    this.fileCreateParamName = options.fileCreateParamName || 'file';
  }

  getProtocol(media) {
    return this.protocol;
  }

  getHostName(media) {
    return this.hostName;
  }

  getCollectionPath(media) {
    return this.collectionPath;
  }

  getResourcePath(media) {
    return this.getCollectionPath(media) + `/#{media.id}`;
  }

  //////////////////////////////////////////////////////////////////
  /// The collection URL to use for createing and fetching media ///
  //////////////////////////////////////////////////////////////////
  getCreateUrl(media) {
    return url.format({
      protocol: this.getProtocol(media),
      hostName: this.getHostName(media),
      port:     this.getPort(media),
      pathname: this.getCollectionPath(media),
      query:    this.getCreateQueryParams(media)
    });
  }

  getUpdateUrl(media) {
    return url.format({
      protocol: this.getProtocol(media),
      hostName: this.getHostName(media),
      port:     this.getPort(media),
      pathname: this.getResourcePath(media),
      query:    this.getUpdateQueryParams(media)
    });
  }

  getDeleteUrl(media) {
    return url.format({
      protocol: this.getProtocol(media),
      hostName: this.getHostName(media),
      port:     this.getPort(media),
      pathname: this.getResourcePath(media),
      query:    this.getDeleteQueryParams(media)
    });
  }

  /////////////////////////////////////////////////////////////////////////////////////////////////////////////////
  /// Returns an object of key/value pairs to pass as query params to the collection url for creating new media ///
  /////////////////////////////////////////////////////////////////////////////////////////////////////////////////
  getCreateQueryParams(media) {
    return this.queryParams;
  }

  getUpdateQueryParams(media) {
    return this.queryParams;
  }

  getDeleteQueryParams(media) {
    return this.queryParams;
  }

  getFileCreateParamName(media) {
    return this.fileCreateParamName;
  }

  ///////////////////////////////////////////////////////////////////////////////////////////
  /// Return an object of key value pairs to include in the FormData when createing media ///
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
