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

/**
 * OAuth error
 */
export default class OAuthError extends Error {
  /**
   * OAuth error response
   * @param {String} error - OAuth error key
   * @param {String} message - OAuth error message
   */
  constructor (error, message = '') {
    super();
    this._error = String(error);
    this._message = String(message);
  }

  /**
   * OAuth error message
   * @returns {String} - message
   */
  get message () {
    return this._message;
  }

  /**
   * OAuth error code
   * @returns {String} - error
   */
  get error () {
    return this._error;
  }

  /**
   * Displayable error string
   * @returns {String} - error
   */
  toString () {
    let error = this._error;

    if (error.includes('_')) {
      error = error.replace('_', ' ').replace(/^./, x => x.toUpperCase());
    }

    if (this._message) {
      return `${error}: ${this._message}`;
    }

    return error;
  }
}
