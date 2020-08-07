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

import SimpleResourceProxy from './SimpleResourceProxy';
import { makeCancelable } from '../utils/helpers';

/**
 * Used for proxying resource => organisation
 */
export default class OwnedResourceProxy extends SimpleResourceProxy {
  /**
   * OwnedResourceProxy Constructor
   * @param {Mapcreator} api - Api instance
   * @param {ResourceBase} parent - Parent instance
   * @param {Class<ResourceBase>} Target - Target constructor
   */
  constructor (api, parent, Target) {
    const resource = Target.resourceName.replace(/s+$/, '');
    const url = `${parent.url}/${resource}s`;

    super(api, Target, url);
  }

  /**
   * Sync items to the organisation
   * @param {Array<ResourceBase>|Array<number>|ResourceBase|number} items - List of items to sync
   * @throws {TypeError}
   * @throws {ApiError}
   * @returns {CancelablePromise}
   */
  sync (items) {
    return this._modifyResourceLink(items, 'PATCH');
  }

  /**
   * Attach items to the organisation
   * @param {Array<ResourceBase>|Array<number>|ResourceBase|number} items - List of items to attach
   * @throws {TypeError}
   * @throws {ApiError}
   * @returns {CancelablePromise}
   */
  attach (items) {
    return this._modifyResourceLink(items, 'POST');
  }

  /**
   * Detach items from the organisation
   * @param {Array<ResourceBase>|Array<number>|ResourceBase|number} items - List of items to unlink
   * @throws {TypeError}
   * @throws {ApiError}
   * @returns {CancelablePromise}
   */
  detach (items) {
    return this._modifyResourceLink(items, 'DELETE');
  }

  /**
   * Attach parent resource to all organisations
   * @throws {ApiError}
   * @returns {CancelablePromise}
   */
  attachAll () {
    return makeCancelable(async signal => {
      await this.api.ky.post(`${this.baseUrl}/all`, { signal });
    });
  }

  /**
   * Detach parent resource to all organisations
   * @throws {ApiError}
   * @returns {CancelablePromise}
   */
  detachAll () {
    return makeCancelable(async signal => {
      await this.api.ky.delete(`${this.baseUrl}/all`, { signal });
    });
  }

  /**
   * @param {Array<ResourceBase>|Array<number>|ResourceBase|number} items - List of items to sync, attach or detach
   * @param {string} method - http method
   * @throws {ApiError}
   * @throws {TypeError}
   * @returns {CancelablePromise}
   * @private
   */
  _modifyResourceLink (items, method) {
    if (!Array.isArray(items)) {
      items = [items];
    }

    const keys = items
      .map(x => OwnedResourceProxy._getKeyValue(x))
      .map(Number)
      .filter(x => !Number.isNaN(x));

    return makeCancelable(async signal => {
      await this.api.ky(this.baseUrl, {
        method,
        signal,
        json: { keys },
      });
    });
  }

  static _getKeyValue (item) {
    if (['number', 'string'].includes(typeof item)) {
      return item;
    }

    const key = item.constructor.resourceUrlKey || 'id';

    if (typeof item[key] !== 'undefined') {
      return item[key];
    }

    throw new TypeError('Expected items to be of type Array<ResourceBase>, Array<number>, ResourceBase or number}');
  }
}
