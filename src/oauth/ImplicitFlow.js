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

import OAuth from './OAuth';
import OAuthToken from './OAuthToken';
import StateContainer from './StateContainer';
import {encodeQueryString} from '../utils/requests';
import OAuthError from '../errors/OAuthError';
import {isNode} from '../utils/node';

/**
 * Implicit OAuth flow using redirection
 */
export default class ImplicitFlow extends OAuth {

  /**
   * Implicit authentication flow
   * @param {String} clientId - OAuth client id
   * @param {String} callbackUrl - callbackUrl for obtaining the token. This should be a
   *                               page with this script on it. If left empty the current
   *                               url will be used.
   * @param {Array<String>} scopes - A list of required scopes
   * @param {Boolean} useState - use state verification
   * @returns {void}
   */
  constructor(clientId, callbackUrl = '', scopes = ['*'], useState = true) {
    super(clientId, scopes);

    if (isNode()) {
      throw new Error(`${this.constructor.name} can't be used under nodejs`);
    }

    this.path = '/oauth/authorize';

    this.callbackUrl = callbackUrl;
    this.useState = useState;

    if (!this.callbackUrl) {
      // Drop the anchor (if any)
      this.callbackUrl = window.location.toString().split('#')[0];
    }

    this._anchorParams = [
      'access_token', 'token_type', 'expires_in',
    ];

    if (this.useState) {
      this._anchorParams.push('state');
    }

    if (this._anchorContainsOAuthResponse()) {
      const anchorParams = this._getOAuthAnchorParams();

      this._cleanAnchorParams();

      if (this.useState && !StateContainer.validate(anchorParams['state'])) {
        throw Error('Invalid state in url');
      } else {
        this.token = OAuthToken.fromResponseObject(anchorParams);
      }
    }
  }

  /**
   * Authenticate
   * @async
   * @returns {OAuthToken} - The resolved token
   * @throws {OAuthError} - Thrown if anything goes wrong during authentication
   */
  async authenticate() {
    if (this.authenticated) {
      return this.token;
    } else if (this._anchorContainsError()) {
      const err = this._getError();

      this._cleanAnchorParams();

      throw err;
    } else {
      window.location = this._buildRedirectUrl();
    }
  }

  /**
   * Builds the url for redirection
   * @returns {String} - Redirect url
   * @protected
   */
  _buildRedirectUrl() {
    const queryParams = {
      'client_id': this.clientId,
      'redirect_uri': this.callbackUrl,
      'response_type': 'token',
      'scope': this.scopes.join(' '),
    };

    if (this.useState) {
      queryParams['state'] = StateContainer.generate();
    }

    return `${this.host + this.path}?${encodeQueryString(queryParams)}`;
  }

  /**
   * Builds an object containing all the anchor parameters
   * @param {String} query - Url hash
   * @returns {Object<String, String>} - Anchor parameters
   * @protected
   */
  _getAnchorParams(query = window.location.hash) {
    const out = {};

    query = query.replace(/^#\/?/g, '');

    for (const raw of query.split('&')) {
      const pair = raw.split('=').map(decodeURIComponent);

      out[pair[0]] = pair[1];
    }

    return out;
  }

  /**
   * Fetch OAuth anchor params
   * @param {Object<String, String>} query - Optional override for the query to analyse, defaults to {@link ImplicitFlow#_getAnchorParams}
   * @returns {Object<String, String>} - List of OAuth anchor parameters
   * @protected
   */
  _getOAuthAnchorParams(query = this._getAnchorParams()) {
    return Object.keys(query)
      .filter(key => this._anchorParams.includes(key))
      .reduce((obj, key) => {
        obj[key] = query[key];
        return obj;
      }, {});
  }

  /**
   * Remove OAuth related anchor parameters
   * @returns {void}
   * @protected
   */
  _cleanAnchorParams() {
    const anchorParams = this._getAnchorParams();
    const targets = this._anchorParams;

    // Just in case
    targets.push('state', 'error');

    for (const key of targets) {
      // Should silently fail when key doesn't exist
      delete anchorParams[key];
    }

    window.location.hash = encodeQueryString(anchorParams);
  }

  /**
   * Test if the anchor contains an OAuth response
   * @returns {Boolean} - if anchor tested positive for containing an OAuth response
   * @protected
   */
  _anchorContainsOAuthResponse() {
    const queryKeys = Object.keys(this._getOAuthAnchorParams());

    // Check if all the params are in the anchor
    return this._anchorParams.reduce((output, key) => {
      return output && queryKeys.includes(key);
    }, true);
  }

  /**
   * Test if the anchor contains an OAuth error
   * @returns {Boolean} - if anchor tested positive for containing an OAuth error
   * @protected
   */
  _anchorContainsError() {
    return Boolean(this._getAnchorParams()['error']);
  }

  /**
   * Get and return the error in the anchor
   * @returns {OAuthError} - OAuthError object
   * @throws {Error} - If no error could be fetched from the anchor
   * @protected
   */
  _getError() {
    if (!this._anchorContainsError()) {
      throw Error('No OAuthError found in anchor');
    }

    const params = this._getAnchorParams();

    return new OAuthError(
      params['error'], params['message']
    );
  }
}
