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

import { isNode } from '../utils/node';
import DataStoreContract from './DataStoreContract';

/**
 * Used for storing data during tests
 * @private
 */
export default class DummyDriver extends DataStoreContract {
  static _data = {};

  /**
   * @inheritDoc
   */
  static get available () {
    return isNode() && process.env.NODE_ENV === 'test';
  }

  /**
   * If the storage is secure
   * @returns {boolean} - Secure storage
   */
  static get secure () {
    return true;
  }

  /**
   * Store a value in the storage
   * @param {String} name - value name
   * @param {*} value - value
   */
  set (name, value) {
    this.constructor._data[name] = value;
  }

  /**
   * Get a value from the store
   * @param {String} name - value name
   * @returns {*} - value
   */
  get (name) {
    return this.constructor._data[name];
  }

  /**
   * Remove a value from the store
   * @param {String} name - value name
   */
  remove (name) {
    delete this.constructor._data[name];
  }

  /**
   * Storage keys
   * @returns {Array<String>} - Stored keys
   */
  keys () {
    return Object.keys(this.constructor._data);
  }
}
