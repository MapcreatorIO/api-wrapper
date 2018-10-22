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

import DataStoreContract from './DataStoreContract';
import {isNode} from '../utils/node';

/**
 * @private
 */
export default class LocalStorageDriver extends DataStoreContract {
  /**
   * LocalStorage name prefix
   * @returns {String} - Prefix
   * @private
   */
  static get _prefix() {
    return '_m4n_';
  }

  /**
   * @inheritDoc
   */
  static get available() {
    return !isNode();
  }

  /**
   * Store a value in the storage
   * @param {String} name - Value name
   * @param {*} value - Value
   * @returns {void}
   */
  set(name, value) {
    name = LocalStorageDriver._prefix + name;

    window.localStorage.setItem(name, value);
  }

  /**
   * Get a value from the store
   * @param {String} name - Value name
   * @returns {void}
   */
  get(name) {
    name = LocalStorageDriver._prefix + name;

    return window.localStorage.getItem(name);
  }

  /**
   * Remove a value from the store
   * @param {String} name - Value name
   * @returns {void}
   */
  remove(name) {
    name = LocalStorageDriver._prefix + name;

    window.localStorage.removeItem(name);
  }

  /**
   * Storage keys
   * @returns {Array<String>} - Stored keys
   */
  keys() {
    const keys = [];
    const storage = window.localStorage;
    const prefix = LocalStorageDriver._prefix;

    for (let i = 0; i < storage.length; i++) {
      let key = storage.key(i);

      if (key.startsWith(prefix)) {
        key = key.replace(new RegExp(`^${prefix}`), '');

        keys.push(key);
      }
    }

    return keys;
  }
}
