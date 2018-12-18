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

import StorageManager from '../storage/StorageManager';
import StaticClass from '../utils/StaticClass';
import Uuid from '../utils/uuid';

/**
 * State container for keeping track of OAuth states (crsf tokens)
 * @static
 * @private
 */
export default class StateContainer extends StaticClass {
  /**
   * LocalStorage key prefix
   * @returns {String} - prefix
   * @constant
   */
  static get prefix () {
    return 'oauth_state_';
  }

  /**
   * Generate and store a state that can be checked at a later point
   * @returns {string} - state
   */
  static generate () {
    const uuid = Uuid.uuid4();
    const key = StateContainer.prefix + uuid;

    StorageManager.best.set(key, Date.now());

    return uuid;
  }

  /**
   * Validate a state
   * @param {String} state - state to validate
   * @param {Boolean} purge - remove from state db after validation
   * @returns {Boolean} - if the state is valid
   */
  static validate (state, purge = true) {
    const storage = StorageManager.best;
    const key = StateContainer.prefix + state;
    const found = typeof storage.get(key) !== 'undefined';

    if (purge && found) {
      storage.remove(key);
    }

    return found;
  }

  /**
   * Remove all states from the state db
   */
  static clean () {
    const tokens = Object.keys(this.list());

    for (const token of tokens) {
      StorageManager.best.remove(StateContainer.prefix + token);
    }
  }

  /**
   * Get states with their corresponding state db key
   * @returns {Object<String, String>} - List of stored states
   */
  static list () {
    const storage = StorageManager.best;

    return storage
      .keys()
      .filter(x => x.startsWith(StateContainer.prefix))
      .map(x => x.replace(StateContainer.prefix, ''))
      .reduce((out, key) => {
        out[key] = storage.get(key);

        return out;
      }, {});
  }
}
