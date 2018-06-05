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
import DataStoreContract from './DataStoreContract';

/**
 * @private
 * @todo fix
 */
export default class CookiesDriver extends DataStoreContract {
  constructor(prefix = '_m4n_') {
    super();

    this.__prefix = prefix;
  }

  /**
   * Cookie name prefix
   * @returns {String} - Prefix
   * @private
   */
  get _prefix() {
    return this.__prefix;
  }

  /**
   * @inheritDoc
   */
  static get secure() {
    return window.location.protocol === 'https:';
  }

  /**
   * @inheritDoc
   */
  static get available() {
    return !isNode();
  }

  /**
   * Store a value in the storage
   * @param {String} name - value name
   * @param {*} value - value
   * @param {Date|String} [expires=2050-01-01] - Expiration date
   * @returns {void}
   */
  set(name, value, expires = new Date('2050-01-01')) {
    name = encodeURIComponent(this._prefix + name);
    value = encodeURIComponent(value);

    if (expires instanceof Date) {
      expires = expires.toUTCString();
    }

    let cookie = `${name}=${value}; expires=${expires}`;

    if (CookiesDriver.secure) {
      cookie += '; secure';
    }

    document.cookie = cookie;
  }

  /**
   * @inheritDoc
   */
  get(name) {
    name = this._prefix + name;

    return this._toObject()[name];
  }

  /**
   * @inheritDoc
   */
  remove(name) {
    name = encodeURIComponent(this._prefix + name);

    let cookie = `${name}=; expires=Thu, 01 Jan 1970 00:00:01 GMT`;

    if (CookiesDriver.secure) {
      cookie += ';secure';
    }

    document.cookie = cookie;
  }

  /**
   * @inheritDoc
   */
  keys() {
    const regex = new RegExp('^' + this._prefix);

    return Object.keys(this._toObject()).map(x => x.replace(regex, ''));
  }

  /**
   * Extract cookies and turn them into a object
   * @returns {Object} - cookies
   * @private
   */
  _toObject() {
    const cookies = {};

    document.cookie
      .split(';')
      .map(x => x.trim().split('=').map(decodeURIComponent))
      .filter(x => x[0].startsWith(this._prefix))
      .forEach(x => {
        cookies[x[0]] = x[1];
      });

    return cookies;
  }
}
