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

import OAuthError from '../errors/OAuthError';
import StorageManager from '../storage/StorageManager';
import ImplicitFlow from './ImplicitFlow';
import OAuthToken from './OAuthToken';

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
      throw new Error('We\'re a flow popup');
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
   * @inheritDoc
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
        this.windowOptions,
      );

      const ticker = setInterval(() => {
        if (popup.closed) {
          reject(new OAuthError('window_closed', 'Pop-up window was closed before data could be extracted'));
        }

        let done = false;

        try {
          done = !['', 'about:blank'].includes(popup.location.href);
        } catch (e) {
          // Nothing
        }

        if (done) {
          clearInterval(ticker);

          const data = this._getAnchorParams(popup.location.hash);

          popup.close();

          if (data.error) {
            reject(new OAuthError(data.error, data.message));
          } else {
            resolve(this.token = OAuthToken.fromResponseObject(data));
          }
        }
      }, 250);
    });
  }
}
