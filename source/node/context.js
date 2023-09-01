const path = require('node:path')
const fs = require('node:fs/promises')
const { constants } = require('node:buffer')

const { logger } = require('./logger')
const base = require('../base')
const { BinaryStream } = base

class Context {
  constructor(host, file) {
    this._host = host;
    this._file = file;
  }

  get identifier() {
    return path.basename(this._file)
  }

  get stream() {
    return this._stream;
  }

  async request(file, encoding, basename) {
    if (basename !== undefined) {
      return this._host.request(file, encoding, basename);
    }

    const stat = await fs.stat(file)
    const fileSize = stat.size
    const MAX_FILE_SIZE = 2 * 1024 * 1024 * 1024

    if (fileSize <= MAX_FILE_SIZE) {
      const buffer = await fs.readFile(file)
      return new BinaryStream(new Uint8Array(buffer))
    }


    const fd = await fs.open(file)
    const chunkSize = 1 * 1024 * 1024 * 1024

    if (fileSize <= constants.MAX_LENGTH) {
      const buffer = new Uint8Array(fileSize)
      let offset = 0

      while (position < fileSize) {
        const len = Math.min(chunkSize, fileSize - position)
        fs.read(buffer, offset, len, null)
        offset += len
      }

      return new BinaryStream(buffer)
    }

    const chunks = [];
    let position = 0;

    while (position < fileSize) {
      const len = Math.min(chunkSize, fileSize - position)
      const buffer = new Uint8Array(len)
      fd.read(buffer, 0, len, null)
      chunks.push(buffer)
      position += len
    }

    return new FileStream(chunks, chunkSize, 0, position);
  }

  require(id) {
    return this._host.require(id);
  }

  exception(error, fatal) {
    this._host.exception(error, fatal);
  }

  async open() {
    this._stream = await this.request(this._file, null);
  }
};

class FileStream {

  constructor(chunks, size, start, length) {
    this._chunks = chunks;
    this._size = size;
    this._start = start;
    this._length = length;
    this._position = 0;
  }

  get position() {
    return this._position;
  }

  get length() {
    return this._length;
  }

  stream(length) {
    const file = new FileStream(this._chunks, this._size, this._start + this._position, length);
    this.skip(length);
    return file;
  }

  seek(position) {
    this._position = position >= 0 ? position : this._length + position;
  }

  skip(offset) {
    this._position += offset;
    if (this._position > this._length) {
      throw new Error('Expected ' + (this._position - this._length) + ' more bytes. The file might be corrupted. Unexpected end of file.');
    }
  }

  peek(length) {
    length = length !== undefined ? length : this._length - this._position;
    if (length < 0x10000000) {
      const position = this._fill(length);
      this._position -= length;
      return this._buffer.subarray(position, position + length);
    }
    const position = this._start + this._position;
    this.skip(length);
    this.seek(position);
    const buffer = new Uint8Array(length);
    this._read(buffer, position);
    return buffer;
  }

  read(length) {
    length = length !== undefined ? length : this._length - this._position;
    if (length < 0x10000000) {
      const position = this._fill(length);
      return this._buffer.subarray(position, position + length);
    }
    const position = this._start + this._position;
    this.skip(length);
    const buffer = new Uint8Array(length);
    this._read(buffer, position);
    return buffer;
  }

  byte() {
    const position = this._fill(1);
    return this._buffer[position];
  }

  _fill(length) {
    if (this._position + length > this._length) {
      throw new Error('Expected ' + (this._position + length - this._length) + ' more bytes. The file might be corrupted. Unexpected end of file.');
    }
    if (!this._buffer || this._position < this._offset || this._position + length > this._offset + this._buffer.length) {
      this._offset = this._position;
      this._buffer = new Uint8Array(Math.min(0x10000000, this._size, this._length - this._offset));
      this._read(this._buffer, this._offset);
    }
    const position = this._position;
    this._position += length;
    return position - this._offset;
  }

  _read(buffer, offset) {
    const index = Math.floor(offset / this._size);
    offset = offset - (index * this._size);
    const length = Math.min(this._chunks[index].length - offset, buffer.length);
    buffer.set(this._chunks[index].subarray(offset, offset + length), 0);
    if (length !== buffer.length) {
      buffer.set(this._chunks[index + 1].subarray(0, buffer.length - length), length);
    }
  }
};

module.exports = {
  Context,
}
