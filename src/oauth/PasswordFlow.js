/*
 * BSD 3-Clause License
 *
 * Copyright (c) 2020, MapCreator
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

import axios from 'axios';
import OAuthError from '../errors/OAuthError';
import { isNode } from '../utils/node';
import OAuth from './OAuth';
import OAuthToken from './OAuthToken';


/**
 * Password authentication flow
 */
export default class PasswordFlow extends OAuth {
  /**
   * @param {string} clientId - OAuth client id
   * @param {string} secret - OAuth secret
   * @param {string} username - Valid username (email)
   * @param {string} password - Valid password
   * @param {Array<string>} scopes - A list of required scopes
   */
  constructor (clientId, secret, username, password, scopes = ['*']) {
    super(clientId, scopes);

    this._secret = secret;
    this._username = username;
    this._password = password;

    this._path = '/oauth/token';

    // Because the client requires a secret HTTPS is highly recommended
    if (!isNode()) {
      console.warn('Using PasswordFlow in the browser is unrecommended. More information: https://nnmm.nl/?MXF');

      if (window.location.protocol !== 'https:') {
        console.warn('Page was not loaded using https. You\'re most likely leaking secrets right now');
      }
    }
  }

  /**
   * it's a secret :o (client secret)
   * @returns {String} - secret
   */
  get secret () {
    return this._secret;
  }

  /**
   * Set client secret
   * @param {String} value - secret
   */
  set secret (value) {
    this._secret = value;
  }

  /**
   * Get the username for authentication
   * @returns {String} - Username (email)
   */
  get username () {
    return this._username;
  }

  /**
   * Get the username for authentication
   * @param {String} value - Username (email)
   */
  set username (value) {
    this._username = value;
  }

  /**
   * Get the password
   * @returns {String} - Password
   */
  get password () {
    return this._password;
  }

  /**
   * Set the password
   * @param {String} value - password
   */
  set password (value) {
    this._password = value;
  }

  /**
   * OAuth path
   * @returns {String} - OAuth path
   */
  get path () {
    return this._path;
  }

  /**
   * OAuth path
   * @param {String} value - OAuth path
   */
  set path (value) {
    this._path = value;
  }

  /**
   * Authenticate
   * @returns {Promise<OAuthToken>} - Response token
   * @throws {OAuthError}
   */
  async authenticate () {
    const url = this.host + this.path;
    const query = {
      'grant_type': 'password',
      'client_id': this.clientId,
      'client_secret': this._secret,
      'username': this.username,
      'password': this.password,
      'scope': this.scopes.join(' '),
    };

    const { data } = await axios.post(url, query);

    if (data.error) {
      throw new OAuthError(data.error, data.message);
    }

    this.token = OAuthToken.fromResponseObject(data);
    this.token.scopes = this.scopes;

    return this.token;
  }
}
