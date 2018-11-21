/*
 * BSD 3-Clause License
 *
 * Copyright (c) 2018, MapCreator
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

import {AbstractClassError, AbstractMethodError} from '../errors/AbstractError';
import ApiError from '../errors/ApiError';
import OAuthError from '../errors/OAuthError';
import StorageManager from '../storage/StorageManager';
import OAuthToken from './OAuthToken';
import StateContainer from './StateContainer';

/**
 * OAuth base class
 * @abstract
 */
export default class OAuth {
  /**
   * @param {String} clientId - OAuth client id
   * @param {Array<String>} scopes - A list of required scopes
   * @returns {void}
   */
  constructor(clientId, scopes = ['*']) {
    if (this.constructor === OAuth) {
      throw new AbstractClassError();
    }

    this.clientId = String(clientId);
    this.scopes = scopes;
    this.token = clientId !== null ? OAuthToken.recover() : null;
    this.host = process.env.HOST;
    this.path = '/';
  }

  /**
   * If the current instance has a valid token
   * @returns {Boolean} - if a valid token is availble
   */
  get authenticated() {
    return this.token !== null && !this.token.expired;
  }

  /**
   * Authenticate
   * @returns {Promise} - Promise resolves with OAuthToken and rejects with OAuthError
   * @abstract
   */
  authenticate() {
    throw new AbstractMethodError();
  }

  /**
   * Forget the current session
   * Empty the session token store and forget the api token
   * @returns {void}
   */
  forget() {
    StateContainer.clean();
    StorageManager.secure.remove(OAuthToken.storageName);

    this.token = null;
  }

  /**
   * Invalidates the session token
   * @throws {OAuthError} - If de-authentication fails
   * @throws {ApiError} - If the api returns errors
   */
  async logout() {
    if (!this.token) {
      return;
    }

    const url = this.host + '/oauth/logout';
    const init = {
      method: 'POST',
      mode: 'cors',
      redirect: 'follow',
      headers: {
        'Accept': 'application/json',
        'Authorization': this.token.toString(),
      },
    };

    try {
      const response = await fetch(url, init);
      const body = await response.text();
      const data = JSON.parse(body);

      if (!data.success) {
        throw new ApiError(data.error.type, data.error.message, response.status);
      }

      if (!response.ok) {
        throw new OAuthError('logout_fail', 'Logout failed:\n' + body);
      }
    } finally {
      this.forget();
    }
  }

  /**
   * Manually import OAuthToken, usefull for debugging
   * @param {String} token - OAuth token
   * @param {String} [type=Bearer] - token type
   * @param {Date|Number} [expires=5 days] - expire time in seconds or Date
   * @param {Array<string>} [scopes=[]] - Any scopes
   * @returns {void}
   */
  importToken(token, type = 'Bearer', expires = 432000, scopes = []) {
    this.token = new OAuthToken(token, type, expires, scopes);
  }
}
