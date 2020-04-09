/*
 * BSD 3-Clause License
 *
 * Copyright (c) 2020, Mapcreator
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

import StorageManager from '../storage/StorageManager';
import { encodeQueryString } from '../utils/requests';

/**
 * Oauth token container
 */
export default class OAuthToken {
  /**
   * @param {String} token - OAuth token
   * @param {String} [type=Bearer] - token type
   * @param {Date|Number} [expires=5 days] - expire time in seconds or Date
   * @param {Array<string>} [scopes=[]] - Any scopes
   */
  constructor (token, type = 'Bearer', expires = 432000, scopes = []) {
    this.scopes = scopes;
    this.token = token;
    this.type = type.toLowerCase().replace(/(\s|^)\w/g, x => x.toUpperCase());

    if (typeof expires === 'number') {
      const ms = expires * 1000;

      // Expires is in seconds
      this.expires = new Date(Date.now() + ms);
    } else if (expires instanceof Date) {
      this.expires = expires;
    } else {
      throw new TypeError('Expires not of type Date or Number');
    }
  }

  /**
   * String representation of the token, usable in the Authorization header
   * @returns {string} - String representation
   */
  toString () {
    return `${this.type} ${this.token}`;
  }

  /**
   * Get equivalent OAuth response object
   * @returns {{access_token: (String|*), token_type: String, expires_in: Number, scope: (Array.<String>|Array|*)}} - Raw response object
   */
  toResponseObject () {
    return {
      'access_token': this.token,
      'token_type': this.type.toLowerCase(),
      'expires_in': this.expires - Date.now(),
      'scope': this.scopes,
    };
  }

  /**
   * Export oauth response query string
   * @returns {string} - OAuth response query
   */
  toQueryString () {
    return encodeQueryString(this.toResponseObject());
  }

  /**
   * If the token has expired
   * @returns {Boolean} - expired
   */
  get expired () {
    return new Date() > this.expires;
  }

  /**
   * Internal storage key name
   * @returns {String} - storage name
   * @constant
   */
  static get storageName () {
    return 'api_token';
  }

  /**
   * Build instance from response object
   * @param {String|Object} data - object or JSON string
   * @returns {OAuthToken} - New OAuthToken instance
   */
  static fromResponseObject (data) {
    if (typeof data === 'string') {
      data = JSON.parse(data);
    }

    // Default expires = 5 days
    let expires = 432000;

    if (typeof data['exipires_in'] !== 'undefined') {
      expires = Number(data['expires_in']);
    } else if (typeof data.expires === 'string') {
      expires = new Date(data.expires);
    }

    return new OAuthToken(
      data['access_token'],
      data['token_type'],
      expires,
      data.scope || [],
    );
  }

  /**
   * Store the token for later recovery. Token will be stored in HTTPS cookie if possible.
   * @param {String} name - db key name
   * @throws {OAuthToken#recover}
   */
  save (name = OAuthToken.storageName) {
    const data = {
      token: this.token,
      type: this.type,
      expires: this.expires.toUTCString(),
      scopes: this.scopes,
    };

    // Third parameter is only used when we're using cookies
    StorageManager.secure.set(name, JSON.stringify(data), this.expires);
  }

  /**
   * Recover a token by looking through the HTTPS cookies and localStorage
   * @param {String} name - Storage key name
   * @returns {OAuthToken|null} - null if none could be recovered
   * @throws {OAuthToken#save}
   */
  static recover (name = OAuthToken.storageName) {
    const data = StorageManager.secure.get(name);

    if (!data) {
      return null;
    }

    const obj = JSON.parse(data);
    const instance = new OAuthToken(obj.token, obj.type, new Date(obj.expires), obj.scopes || []);

    if (instance.expired) {
      return null;
    }

    return instance;
  }
}
