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

import mitt from 'mitt';
import {LogLevel} from './enums/LogLevel';


export default class Logger {
  constructor(prefix, logLevel) {
    this._prefix = prefix;
    this._logLevel = logLevel;
    this._emitter = mitt();
  }

  /**
   * Logger prefix
   * @returns {string} - Logger prefix
   */
  get prefix() {
    return this._prefix;
  }

  /**
   * Logger prefix
   * @param {string} value - Logger prefix
   */
  set prefix(value) {
    this._prefix = String(value);
  }

  /**
   * Minimum log level
   * @returns {number} - Log level
   * @see {@link LogLevel}
   */
  get logLevel() {
    return this._logLevel;
  }

  /**
   * Minimum log level
   * @param {number} value - Log level
   */
  set logLevel(value) {
    this._logLevel = this._validateLogLevel(value);
  }

  _log(level, message) {
    this._emitter.emit('', message);
  }

  /**
   * Validate and normalize level
   * @param {number|string} level - Log level
   * @returns {number} - Log level
   * @private
   * @throws TypeError
   */
  _validateLogLevel(level) {
    if (typeof level === 'number') {
      const values = LogLevel.values();

      if (!values.includes(level)) {
        throw new TypeError(`Invalid log level: wanted value between 0 and ${Math.max(values)} (inclusive), got ${level}.`);
      }

      return level;
    } else if (typeof level === 'string') {
      const keys = LogLevel.keys();

      level = level.toLowerCase();

      if (!keys.includes(level)) {
        throw new TypeError(`Invalid log level "${level}". Expected one of ${keys.join(', ')}`);
      }

      return LogLevel[level.toUpperCase()];
    } else {
      throw new TypeError('Expected log level to be of type "string" or "number"');
    }
  }
}