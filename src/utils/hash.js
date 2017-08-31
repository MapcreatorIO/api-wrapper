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

import {encodeQueryString} from './requests';

const FNV1_32A_INIT = 0x811c9dc5;

/**
 * Fast hash function for non-cryptographic use
 * @param {string} str - Input to be hashed
 * @returns {string} - String representation of the hash
 * @private
 */
export function pfnv32a(str) {
  const hash = str
    .split('')
    .map(x => x.charCodeAt(0))
    .reduce((sum, val) => {
      sum ^= val;
      return sum + (sum << 1) + (sum << 4) + (sum << 7) + (sum << 8) + (sum << 24);
    }, FNV1_32A_INIT);

  return ('0000000' + (hash >>> 0).toString(16)).substr(-8);
}

/**
 * Fast object hashing for non-cryptographic use
 * @param {object} data - input data
 * @returns {string} - String reprisentation of the hash
 * @private
 */
export function hashObject(data) {
  return fnv32a(encodeQueryString(data));
}
