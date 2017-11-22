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

import {getTypeName} from '../utils/reflection';
import SimpleResourceProxy from './SimpleResourceProxy';

/**
 * Used for proxying resource => organisation
 */
export default class OwnedResourceProxy extends SimpleResourceProxy {
  /**
   * OwnedResourceProxy Constructor
   * @param {Maps4News} api - api instance
   * @param {Organisation} parent - parent instance
   * @param {constructor} Target - target constructor
   */
  constructor(api, parent, Target) {
    const resource = (new Target(api)).resourceName.replace(/s+$/, '');
    const url = `${parent.url}/${resource}s`;

    super(api, Target, url);
  }

  /**
   * Sync items to the organisation
   * @param {Array<Organisation>|Array<number>|Organisation|number} items - List of items to sync
   * @returns {Promise} - Resolves with an empty {@link Object} and rejects with an {@link ApiError} instance.
   * @throws {TypeError} If the provided items are not of the same type as the proxy target
   * @see http://es6-features.org/#PromiseCombination
   */
  sync(items) {
    return this._modifyResourceLink(items, 'PATCH');
  }

  /**
   * Attach items to the organisation
   * @param {Array<Organisation>|Array<number>|Organisation|number} items - List of items to attach
   * @returns {Promise} - Resolves with an empty {@link Object} and rejects with an {@link ApiError} instance.
   * @throws {TypeError}If the provided items are not of the same type as the proxy target
   * @see http://es6-features.org/#PromiseCombination
   */
  attach(items) {
    return this._modifyResourceLink(items, 'POST');
  }

  /**
   * Detach items from the organisation
   * @param {Array<Organisation>|Array<number>|Organisation|number} items - List of items to unlink
   * @returns {Promise} - Resolves with an empty {@link Object} and rejects with an {@link ApiError} instance.
   * @throws {TypeError} If the provided items are not of the same type as the proxy target
   * @see http://es6-features.org/#PromiseCombination
   */
  detach(items) {
    return this._modifyResourceLink(items, 'DELETE');
  }

  /**
   * Attach parent resource to all organisations
   * @returns {Promise} - Promise will resolve with no value and reject with an {@link ApiError} instance.
   */
  attachAll() {
    const url = this._baseUrl + '/all';

    return this.api.request(url, 'POST');
  }

  /**
   * Detach parent resource to all organisations
   * @returns {Promise} - Promise will resolve with no value and reject with an {@link ApiError} instance.
   */
  detachAll() {
    const url = this._baseUrl + '/all';

    return this.api.request(url, 'DELETE');
  }

  /**
   * @param {Array<Organisation>|Array<number>|Organisation|number} items - List of items to sync, attach or detach
   * @param {string} method - http method
   * @returns {Promise} - Promise will resolve with no value and reject with an {@link ApiError} instance.
   * @private
   */
  _modifyResourceLink(items, method) {
    if (!(items instanceof Array)) {
      items = [items];
    }

    const validData = items
      .map(getTypeName)
      .filter(x => !['Number', 'Organisation'].includes(x))
      .length === 0;

    if (!validData) {
      throw new TypeError('Expected items to be of type Array<Organisation>, Array<number>, Organisation or number}');
    }

    const keys = items.map(x => typeof x === 'number' ? x : Number(x.id));

    return this.api.request(this._baseUrl, method, {keys});
  }
}
