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

import OAuthError from '../errors/OAuthError';
import {sleep} from '../utils/helpers';
import ImplicitFlow from './ImplicitFlow';
import OAuthToken from './OAuthToken';

/**
 * Implicit OAuth flow using a pop-up.
 */
export default class ImplicitFlowPopup extends ImplicitFlow {
  /**
   * Implicit pop-up authentication flow
   * @param {String} clientId - OAuth client id
   * @param {String} callbackUrl - CallbackUrl for obtaining the token. This should be a
   *                               page with this script on it. If left empty the current
   *                               url will be used.
   * @param {Array<String>} scopes - A list of required scopes
   * @param {Boolean} useState - Use state verification
   * @param {String} windowOptions - Optional window options for the pop-up window
   * @returns {void}
   */
  constructor(clientId, callbackUrl = '', scopes = ['*'], useState = false, windowOptions = process.env.WINDOW_OPTIONS) {
    super(clientId, callbackUrl, scopes, useState);

    this.windowOptions = windowOptions;

    if (window.name === ImplicitFlowPopup.popupWindowName) {
      throw new Error('We\'re a flow popup');
    }
  }

  /**
   * Popup window name
   * @returns {String} - Window.name of the created pop-up
   * @constant
   */
  static get popupWindowName() {
    return 'm4n_api_auth';
  }

  /**
   * Authenticate
   * @async
   * @returns {OAuthToken} - The resolved token
   * @throws {OAuthError} - Thrown if anything goes wrong during authentication
   */
  async authenticate() {
    if (window.name === ImplicitFlowPopup.popupWindowName) {
      return null;
    }

    if (this.authenticated) {
      return this.token;
    }

    const popup = window.open(
      this._buildRedirectUrl(),
      ImplicitFlowPopup.popupWindowName,
      this.windowOptions,
    );

    while (popup) {
      if (popup.closed) {
        throw new OAuthError('window_closed', 'Pop-up window was closed before data could be extracted');
      }

      try {
        const redirected = !['', 'about:blank'].includes(popup.location.href);

        // If we're redirected back then we can start analysing the url
        if (redirected) {
          break;
        }

      } catch (e) {
        // Catches DOMException thrown when the popup is cross-origin
        // this means we haven't been redirected back yet
      }

      await sleep(250);
    }

    const data = this._getAnchorParams(popup.location.hash);

    popup.close();

    if (data.error) {
      throw new OAuthError(data.error, data.message);
    } else {
      this.token = OAuthToken.fromResponseObject(data);

      return this.token;
    }
  }
}
