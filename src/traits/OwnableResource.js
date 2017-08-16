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

import {isParentOf} from '../utils/reflection';
import {Trait} from './Trait';

/**
 * Provides a {@link ResourceBase} with functions for dealing with being ownable by an organisation
 * @mixin
 */
export default class OwnableResource extends Trait {
  /**
   *
   * @returns {Promise} - Promise will resolve with {@link Array<Organisation>} and reject with an {@link ApiError} instance.
   */
  get organisations() {
    // This is a hack to fix a circular dependency issue
    const Organisation = require('../crud/Organisation').default;

    return this._proxyResourceList(Organisation, `${this.url}/organisations`);
  }

  /**
   * Sync items to the organisation
   * @param {Array<ResourceBase>} items - List of items to sync
   * @returns {Promise} - Promise will resolve with no value and reject with an {@link ApiError} instance.
   */
  syncOrganisations(items) {
    return this._modifyOrganisationLink(items, 'PATCH');
  }

  /**
   * Attach items to the organisation
   * @param {Array<ResourceBase>} items - List of items to attach
   * @returns {Promise} - Promise will resolve with no value and reject with an {@link ApiError} instance.
   */
  attachOrganisations(items) {
    return this._modifyOrganisationLink(items, 'POST');
  }

  /**
   * Unlink items from the organisation
   * @param {Array<Organisation>|Array<Number>} items - List of items to unlink
   * @returns {Promise} - Promise will resolve with no value and reject with an {@link ApiError} instance.
   */
  unlinkOrganisations(items) {
    return this._modifyOrganisationLink(items, 'DELETE');
  }

  /**
   * Sync, attach or unlink resources
   * @param {Array<Organisation>|Array<Number>} items - List of items to sync or attach
   * @param {String} method - Http method to use
   * @returns {Promise} - Promise will resolve with no value and reject with an {@link ApiError} instance.
   * @private
   */
  _modifyOrganisationLink(items, method) {
    // This is a hack to fix a circular dependency issue
    const Organisation = require('../crud/Organisation').default;

    const filter = x => !isParentOf(Organisation, x) && !isParentOf(Number, x);
    const isValid = items.filter(filter).length === 0;

    if (!isValid) {
      throw new TypeError('Array must contain either Numbers (organisation id) or Organisations.');
    }

    const keys = items.map(x => typeof x === 'number' ? x : x.id).map(Number);

    return this.api.request(`${this.url}/organisations`, method, {keys});
  }

  /**
   * If the resource can be owned by an organisation
   * @returns {boolean} - Can be owned by an organisation
   */
  get ownable() {
    return true;
  }
}
