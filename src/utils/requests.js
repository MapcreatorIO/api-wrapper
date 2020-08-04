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

import { windowTest } from './node';

function getFormData () {
  if (windowTest('FormData')) {
    return window.FormData;
  }

  return require('form-data');
}

/**
 * @private
 */
export const FormData = getFormData();

/**
 * Encodes an object to a http query string with support for recursion
 * @param {Object<string, *>} paramsObject - data to be encoded
 * @param {Array<string>} _basePrefix - Used internally for tracking recursion
 * @returns {string} - encoded http query string
 *
 * @see http://stackoverflow.com/a/39828481
 * @private
 */
function _encodeQueryString (paramsObject, _basePrefix = []) {
  return Object
    .keys(paramsObject)
    .sort()
    .map(key => {
      const prefix = _basePrefix.slice(0);

      if (typeof paramsObject[key] === 'object' && paramsObject[key] !== null) {
        prefix.push(key);

        return _encodeQueryString(paramsObject[key], prefix);
      }

      prefix.push(key);

      let out = '';

      out += encodeURIComponent(prefix.shift()); // main key
      out += prefix.map(item => `[${encodeURIComponent(item)}]`).join(''); // optional array keys

      const value = paramsObject[key];

      if (value !== null && typeof value !== 'undefined') {
        out += `=${encodeURIComponent(value)}`; // value
      }

      return out;
    }).join('&');
}

/**
 * Encodes an object to a http query string with support for recursion
 * @param {object<string, *>} paramsObject - data to be encoded
 * @returns {string} - encoded http query string
 *
 * @private
 */
export function encodeQueryString (paramsObject) {
  const query = _encodeQueryString(paramsObject);

  // Removes any extra unused &'s.
  return query.replace(/^&*|&+(?=&)|&*$/g, '');
}

export function wrapKyPrefixUrl (fn, baseUrl) {
  return function (input, options) {
    if (typeof input === 'string' && !/^https?:\/\//.test(input)) {
      if (!input.startsWith('/')) {
        input = `/${input}`;
      }

      input = baseUrl + input;
    }

    return fn(input, options);
  };
}