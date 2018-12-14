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

/**
 * Simple logger implementation
 */
export default class Logger {
  /**
   * Create a Logger instance
   * @param {string} [logLevel=warn] - Log level
   */
  constructor(logLevel = 'warn') {
    this.logLevel = logLevel;
  }

  /**
   * Get available log levels
   * @returns {Array<string>} - Log levels
   */
  getLogLevels() {
    return [
      'debug',
      'info',
      'warn',
      'error',
      'none',
    ];
  }

  /**
   * Log a message
   * @param {string} message - Message to be logged
   * @param {string} level - Log level
   */
  log(message, level = 'info') {
    if (level === 'none') {
      return;
    }

    if (this._shouldLog(level)) {
      // eslint-disable-next-line no-console
      console[level](message);
    }
  }

  /**
   * Log a debug message
   * @param {string} message - Message to be logged
   */
  debug(message) {
    this.log(message, 'debug');
  }

  /**
   * Log an informative message
   * @param {string} message - Message to be logged
   */
  info(message) {
    this.log(message, 'info');
  }

  /**
   * Log a warning message
   * @param {string} message - Message to be logged
   */
  warn(message) {
    this.log(message, 'warn');
  }

  /**
   * Log an error message
   * @param {string} message - Message to be logged
   */
  error(message) {
    this.log(message, 'error');
  }

  /**
   * Get the current log level
   * @returns {string} - log level
   */
  get logLevel() {
    return this._logLevel;
  }

  /**
   * Set the current log level
   * @param {string} value - log level
   * @throws {Logger#getLogLevels}
   */
  set logLevel(value) {
    value = value.toLowerCase();

    if (!this.getLogLevels().includes(value)) {
      throw new TypeError(`Expected one of ${this.getLogLevels().join(', ')}. Got ${value}`);
    }

    this._logLevel = value;
  }

  _shouldLog(level) {
    const logLevels = this.getLogLevels();

    const targetLevel = logLevels.findIndex(x => x === level);
    const currentLevel = logLevels.findIndex(x => x === this.logLevel);

    return targetLevel >= currentLevel;
  }
}
