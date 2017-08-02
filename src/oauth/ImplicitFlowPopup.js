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

import ImplicitFlow from './ImplicitFlow';
import OAuthToken from './OAuthToken';
import OAuthError from './OAuthError';

/**
 * Implicit OAuth flow using a pop-up.
 */
export default class ImplicitFlowPopup extends ImplicitFlow {
  /**
   * Implicit pop-up authentication flow
   * @param {String} clientId - OAuth client id
   * @param {String} callbackUrl - callbackUrl for obtaining the token. This should be a
   *                               page with this script on it. If left empty the current
   *                               url will be used.
   * @param {Array<String>} scopes - A list of required scopes
   * @param {Boolean} useState - use state verification
   * @param {String} windowOptions - optional window options for the pop-up window
   * @returns {void}
   */
  constructor(clientId, callbackUrl = '', scopes = ['*'], useState = false, windowOptions = process.env.WINDOW_OPTIONS) {
    super(clientId, callbackUrl, scopes, useState);

    this.windowOptions = windowOptions;

    if (window.name === ImplicitFlowPopup.popupWindowName) {
      const data = this.token.toResponseObject() || this._getAnchorParams();

      localStorage.setItem(ImplicitFlowPopup.localStorageKey, JSON.stringify(data));

      window.close();
    }
  }

  /**
   * Popup window name
   * @returns {String} - window.name of the created pop-up
   * @constant
   */
  static get popupWindowName() {
    return 'm4n_api_auth';
  }

  /**
   * localStorage key name for temporarily storing the token
   * @returns {String} - key name
   * @constant
   */
  static get localStorageKey() {
    return 'm4n_api_auth_response';
  }

  /**
   * Authenticate
   * @returns {Promise} - Promise resolves with {@link OAuthToken} and rejects with {@link OAuthError}
   */
  authenticate() {
    if (window.name === ImplicitFlowPopup.popupWindowName) {
      return new Promise(() => {
      });
    }

    // Should be super.super.authenticate() :/
    if (this.authenticated) {
      return new Promise(resolve => {
        resolve(this.token);
      });
    }

    return new Promise((resolve, reject) => {
      const popup = window.open(
        this._buildRedirectUrl(),
        ImplicitFlowPopup.popupWindowName,
        this.windowOptions
      );

      const ticker = setInterval(() => {
        if (popup.closed) {
          clearInterval(ticker);

          const data = JSON.parse(localStorage.getItem(ImplicitFlowPopup.localStorageKey));

          localStorage.removeItem(ImplicitFlowPopup.localStorageKey);

          if (!data) {
            reject(new OAuthError('window_closed', 'Pop-up window was closed'));
          } else if (data.error) {
            reject(new OAuthError(data.error, data.message));
          } else {
            resolve(this.token = OAuthToken.fromResponseObject(data));
          }
        }
      }, 500);
    });
  }
}
