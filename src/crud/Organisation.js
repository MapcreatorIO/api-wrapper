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

import CrudBase from './base/CrudBase';
import Color from './Color';
import Contract from './Contract';
import DimensionSet from './DimensionSet';
import Feature from './Feature';
import FontFamily from './FontFamily';
import JobShare from './JobShare';
import JobType from './JobType';
import Layer from './Layer';
import MapstyleSet from './MapstyleSet';
import SvgSet from './SvgSet';
import User from './User';


export default class Organisation extends CrudBase {
  /**
   * Sync items to the organisation
   * @param {Array<ResourceBase>|ResourceBase} items - List of items to sync
   * @returns {Array<Promise>|Promise} - Array containing promises for each item type. Each will resolve with an empty {@link Object} and reject with an {@link ApiError} instance.
   * @throws {TypeError} If the provided items contain anything that is not ownable
   * @see http://es6-features.org/#PromiseCombination
   */
  sync(items) {
    return this._modifyResourceLink(items, 'PATCH');
  }

  /**
   * Attach items to the organisation
   * @param {Array<ResourceBase>|ResourceBase} items - List of items to attach
   * @returns {Array<Promise>|Promise} - Array containing promises for each item type Each will resolve with no value and reject with an {@link ApiError} instance.
   * @throws {TypeError} If the provided items contain anything that is not ownable
   * @see http://es6-features.org/#PromiseCombination
   */
  attach(items) {
    return this._modifyResourceLink(items, 'POST');
  }

  /**
   * Unlink items from the organisation
   * @param {Array<ResourceBase>|ResourceBase} items - List of items to unlink
   * @returns {Array<Promise>|Promise} - Array containing promises for each item type Each will resolve with no value and reject with an {@link ApiError} instance.
   * @throws {TypeError} If the provided items contain anything that is not ownable
   * @see http://es6-features.org/#PromiseCombination
   */
  unlink(items) {
    return this._modifyResourceLink(items, 'DELETE');
  }

  /**
   * Sync, attach or unlink resources
   * @param {Array<ResourceBase>|ResourceBase} items - List of items to sync or attach
   * @param {String} method - Http method to use
   * @returns {Array<Promise>|Promise} - Array containing promises for each item type Each will resolve with no value and reject with an {@link ApiError} instance.
   * @throws {TypeError} If the provided items contain anything that is not ownable
   * @private
   */
  _modifyResourceLink(items, method) {
    const isCollection = items instanceof Array;
    const collections = this._reduceOwnable(isCollection ? items : [items]);
    const out = [];

    for (const key of Object.keys(collections)) {
      const url = `${this.url}/${key}`;
      const data = {keys: collections[key]};
      const promise = this.api.request(url, method, data);

      out.push(promise);
    }

    return isCollection ? out : out[0];
  }

  /**
   * Reduce the items to a more usable list
   * @param {Array<ResourceBase>} items - List of items to reduce
   * @returns {Object<String, Array<Number>>} - Object keys are resource names and the value is an array containing ids to sync/attach
   * @throws {TypeError} If the provided items contain anything that is not ownable
   * @private
   */
  _reduceOwnable(items) {
    const out = {};

    for (const row of items) {
      if (!row.ownable) {
        throw new TypeError(`${row.constructor.name}::ownable is false. Is it ownable?\nSee: https://mapcreatoreu.github.io/m4n-api/class/src/traits/OwnableResource.js~OwnableResource.html`);
      }

      const key = row.resourceName;

      if (!out[key]) {
        out[key] = [row.id];
      } else {
        out[key].push(row.id);
      }
    }

    return out;
  }

  get resourceName() {
    return 'organisations';
  }

  // Resource listing
  /**
   * Get the list font families linked to the organisation
   * @returns {Promise} - Resolves with {@link PaginatedResourceListing} instance containing {@link FontFamily} instances and rejects with {@link ApiError}
   */
  fontFamilies() {
    return this._listResource(FontFamily);
  }

  /**
   * Get the list dimension sets linked to the organisation
   * @returns {Promise} - Resolves with {@link PaginatedResourceListing} instance containing {@link DimensionSet} instances and rejects with {@link ApiError}
   */
  dimensionSets() {
    return this._listResource(DimensionSet);
  }

  /**
   * Get the list mapstyle sets linked to the organisation
   * @returns {Promise} - Resolves with {@link PaginatedResourceListing} instance containing {@link MapstyleSet} instances and rejects with {@link ApiError}
   */
  mapstyleSets() {
    return this._listResource(MapstyleSet);
  }

  /**
   * Get the list svg sets linked to the organisation
   * @returns {Promise} - Resolves with {@link PaginatedResourceListing} instance containing {@link SvgSet} instances and rejects with {@link ApiError}
   */
  svgSets() {
    return this._listResource(SvgSet);
  }

  /**
   * Get the list colors linked to the organisation
   * @returns {Promise} - Resolves with {@link PaginatedResourceListing} instance containing {@link Color} instances and rejects with {@link ApiError}
   */
  colors() {
    return this._listResource(Color);
  }

  /**
   * Get the list features linked to the organisation
   * @returns {Promise} - Resolves with {@link PaginatedResourceListing} instance containing {@link Feature} instances and rejects with {@link ApiError}
   */
  features() {
    return this._listResource(Feature);
  }

  /**
   * Get the list layers linked to the organisation
   * @returns {Promise} - Resolves with {@link PaginatedResourceListing} instance containing {@link Layer} instances and rejects with {@link ApiError}
   */
  layers() {
    return this._listResource(Layer);
  }

  /**
   * Get the list job types linked to the organisation
   * @returns {Promise} - Resolves with {@link PaginatedResourceListing} instance containing {@link JobType} instances and rejects with {@link ApiError}
   */
  jobTypes() {
    return this._listResource(JobType);
  }

  /**
   * Get the list job shares linked to the organisation
   * @returns {Promise} - Resolves with {@link PaginatedResourceListing} instance containing {@link JobShare} instances and rejects with {@link ApiError}
   */
  jobShares() {
    return this._listResource(JobShare);
  }

  /**
   * Get the list users linked to the organisation
   * @returns {Promise} - Resolves with {@link PaginatedResourceListing} instance containing {@link User} instances and rejects with {@link ApiError}
   */
  users() {
    return this._listResource(User);
  }

  /**
   * Get the list contracts linked to the organisation
   * @returns {Promise} - Resolves with {@link PaginatedResourceListing} instance containing {@link Contract} instances and rejects with {@link ApiError}
   */
  contracts() {
    return this._listResource(Contract);
  }
}
