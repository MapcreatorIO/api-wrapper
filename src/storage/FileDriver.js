/*
 * BSD 3-Clause License
 *
 * Copyright (c) 2017, MapCreator
 * All rights reserved.
 *
 * Redistribution and use in source and binary forms, with or without
 * modification, are permitted provided that the following conditions are met:
 *
 *  Redistributions of source code must retain the above copyright notice, this
 *   list of conditions and the following disclaimer.
 *
 *  Redistributions in binary form must reproduce the above copyright notice,
 *   this list of conditions and the following disclaimer in the documentation
 *   and/or other materials provided with the distribution.
 *
 *  Neither the name of the copyright holder nor the names of its
 *   contributors may be used to endorse or promote products derived from
 *   this software without specific prior written permission.
 *
 * THIS SOFTWARE IS PROVIDED BY THE COPYRIGHT HOLDERS AND CONTRIBUTORS "AS IS"
 * AND ANY EXPRESS OR IMPLIED WARRANTIES, INCLUDING, BUT NOT LIMITED TO, THE
 * IMPLIED WARRANTIES OF MERCHANTABILITY AND FITNESS FOR A PARTICULAR PURPOSE ARE
 * DISCLAIMED. IN NO EVENT SHALL THE COPYRIGHT HOLDER OR CONTRIBUTORS BE LIABLE
 * FOR ANY DIRECT, INDIRECT, INCIDENTAL, SPECIAL, EXEMPLARY, OR CONSEQUENTIAL
 * DAMAGES (INCLUDING, BUT NOT LIMITED TO, PROCUREMENT OF SUBSTITUTE GOODS OR
 * SERVICES; LOSS OF USE, DATA, OR PROFITS; OR BUSINESS INTERRUPTION) HOWEVER
 * CAUSED AND ON ANY THEORY OF LIABILITY, WHETHER IN CONTRACT, STRICT LIABILITY,
 * OR TORT (INCLUDING NEGLIGENCE OR OTHERWISE) ARISING IN ANY WAY OUT OF THE USE
 * OF THIS SOFTWARE, EVEN IF ADVISED OF THE POSSIBILITY OF SUCH DAMAGE.
 */

import {isNode} from '../utils/node';
import DataStoreDriver from './DataStoreDriver';

/**
 * @private
 */
export default class FileDriver extends DataStoreDriver {
  /**
   * @param {String} path - File storage path
   * @inheritDoc
   */
  constructor(path = '.m4n') {
    super();

    this._path = path;
  }

  /**
   * File storage path
   * @returns {String} - path
   */
  get path() {
    return this._path;
  }

  /**
   * File storage path
   * @param {String} value - path
   */
  set path(value) {
    if (typeof value !== 'string') {
      throw new TypeError('Expected "path" value to be of type "string"');
    }

    this._path = value;
  }

  get realPath() {
    if (this.path.startsWith('/')) {
      return this.path;
    }

    // eslint-disable-next-line no-undef
    return this._fs.realpathSync(this.path);
  }

  /**
   * @inheritDoc
   */
  static get available() {
    return isNode();
  }

  /**
   * @inheritDoc
   */
  static get secure() {
    return true;
  }

  /**
   * @inheritDoc
   */
  set(name, value) {
    const data = this._read();

    data[name] = value;

    this._write(data);
  }

  /**
   * @inheritDoc
   */
  get(name) {
    return this._read()[name];
  }

  /**
   * @inheritDoc
   */
  remove(name) {
    const data = this._read();

    delete data[name];

    this._write(data);
  }

  /**
   * @inheritDoc
   */
  clear() {
    this._write({});
  }

  /**
   * @inheritDoc
   */
  keys() {
    return Object.keys(this._read());
  }

  /**
   * Read file and parse
   * @returns {Object<String, String>} - Key, value object
   * @private
   */
  _read() {
    let data;

    try {
      data = this._fs.readFileSync(this.realPath).toString();
    } catch (e) {
      data = '{}';
    }

    if (!data) {
      return {};
    }

    return JSON.parse(data);
  }

  /**
   * Write data to file
   * @param {Object<String, String>} obj - Key, value object
   * @returns {void}
   * @private
   */
  _write(obj) {
    const data = JSON.stringify(obj);
    const fd = this._fs.openSync(this.realPath, 'w');

    this._fs.writeSync(fd, data);
    this._fs.closeSync(fd);
  }

  /**
   * Get fs instance
   * @returns {fs} - fs instance
   * @private
   */
  get _fs() {
    if (!this.__fs) {
      // eslint-disable-next-line no-eval
      this.__fs = eval('require("fs")');
    }

    return this.__fs;
  }
}
