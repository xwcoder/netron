class Context {
  constructor(host, url, identifier, stream) {
    this._host = host;
    this._stream = stream;
    if (identifier) {
      this._identifier = identifier;
      this._base = url;
      if (this._base.endsWith('/')) {
        this._base.substring(0, this._base.length - 1);
      }
    } else {
      const parts = url.split('?')[0].split('/');
      this._identifier = parts.pop();
      this._base = parts.join('/');
    }
  }

  get identifier() {
    return this._identifier;
  }

  get stream() {
    return this._stream;
  }

  request(file, encoding, base) {
    return this._host.request(file, encoding, base === undefined ? this._base : base);
  }

  require(id) {
    return this._host.require(id);
  }

  exception(error, fatal) {
    this._host.exception(error, fatal);
  }
}

module.exports = {
  Context,
}
