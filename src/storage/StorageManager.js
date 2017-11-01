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

import StaticClass from '../utils/StaticClass';
import CookiesDriver from './CookiesDriver';
import FileDriver from './FileDriver';
import LocalStorageDriver from './LocalStorageDriver';

/**
 * @private
 */
export default class StorageManager extends StaticClass {
  /**
   * Available storage drivers
   * @returns {Array.<function>} - Available storage drivers
   */
  static get available() {
    return [
      LocalStorageDriver,
      CookiesDriver,
      FileDriver,
    ].filter(x => x.available);
  }

  /**
   * Get LocalStorageDriver instance
   * @returns {LocalStorageDriver} - instance
   */
  static get localStorage() {
    return new LocalStorageDriver();
  }

  /**
   * Get CookiesDriver instance
   * @returns {CookiesDriver} - instance
   */
  static get cookies() {
    return new CookiesDriver();
  }

  /**
   * Get FileDriver instance
   * @returns {FileDriver} - instance
   */
  static get file() {
    return new FileDriver();
  }

  /**
   * Returns the best available storage driver. For a secure driver use {@link StorageManager#secure}
   * @returns {DataStoreDriver} - Best available storage driver
   */
  static get best() {
    return new this.available[0]();
  }

  /**
   * Returns the a secure storage driver
   * @returns {DataStoreDriver} - Secure storage driver
   */
  static get secure() {
    const C = this.available.filter(x => x.secure)[0];

    if (typeof C === 'undefined') {
      return StorageManager.best;
    }
  }
}
