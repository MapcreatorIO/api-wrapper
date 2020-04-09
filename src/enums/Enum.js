/*
 * BSD 3-Clause License
 *
 * Copyright (c) 2020, Mapcreator
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

import { constant as constantCase } from 'case';
import { getTypeName } from '../utils/reflection';
import Unobservable from '../utils/Unobservable';


/**
 * Base enum class
 * @example
 * const Colors = new Enum(['RED', 'BLACK', 'GREEN', 'WHITE', 'BLUE']);
 *
 * const Answers = new Enum({
 *   YES: true,
 *   NO: false,
 *   // Passing functions as values will turn them into getters
 *   // Getter results will appear in ::values
 *   MAYBE: () => Math.random() >= 0.5,
 * });
 *
 * const FontStyles = new Enum(['italic', 'bold', 'underline', 'regular'], true);
 * FontStyles.ITALIC === 'italic'
 * FontStyles.BOLD   === 'bold'
 *
 * // etc...
 */
export default class Enum extends Unobservable {
  /**
   * @param {Object<String, *>|Array<String>} enums - Data to build the enum from
   * @param {boolean} auto - Auto generate enum from data making assumptions about
   *                         the data, requires enums to be of type array.
   */
  constructor (enums, auto = false) {
    super();

    const isArray = Array.isArray(enums);

    if (auto && !isArray) {
      throw new TypeError(`Expected enums to be of type "Array" got "${getTypeName(enums)}"`);
    }

    if (isArray && auto) {
      for (const row of enums) {
        const key = constantCase(row);

        Object.defineProperty(this, key, {
          enumerable: true,
          value: row,
        });
      }
    } else if (isArray) {
      for (const key of enums) {
        Object.defineProperty(this, key, {
          enumerable: true,
          value: Enum._iota,
        });
      }
    } else {
      for (const key of Object.keys(enums)) {
        const init = { enumerable: true };

        if (typeof enums[key] === 'function') {
          init.get = enums[key];
        } else {
          init.value = enums[key];
        }

        Object.defineProperty(this, key, init);
      }
    }

    Object.freeze(this);
  }

  /**
   * List enum keys
   * @returns {Array} - Enum keys
   */
  keys () {
    return Object.keys(this);
  }

  /**
   * List enum values
   * @returns {Array<*>} - Enum values
   */
  values () {
    return this.keys()
      .map(key => this[key])
      .filter((v, i, s) => s.indexOf(v) === i);
  }

  static get _iota () {
    if (!Enum.__iota) {
      Enum.__iota = 0;
    }

    return Enum.__iota++;
  }
}
