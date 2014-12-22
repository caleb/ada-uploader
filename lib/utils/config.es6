class Config {
  constructor() {
    this.host = window.location.host;
    this.port = window.location.port;
    this.photosPath = null;
    this.videosPath = null;
  }
}

module.exports = Config;
