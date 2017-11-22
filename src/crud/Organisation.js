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
import OwnedResourceProxy from '../proxy/OwnedResourceProxy';


export default class Organisation extends CrudBase {
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
        throw new TypeError(`${row.constructor.name}::ownable is false. Is it ownable?\nSee: https://mapcreatoreu.github.io/api-wrapper/class/src/traits/OwnableResource.js~OwnableResource.html`);
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
   * @returns {SimpleResourceProxy} - A proxy for accessing the resource
   */
  get fontFamilies() {
    return this._proxyBuilder(FontFamily);
  }

  /**
   * Get the list dimension sets linked to the organisation
   * @returns {SimpleResourceProxy} - A proxy for accessing the resource
   */
  get dimensionSets() {
    return this._proxyBuilder(DimensionSet);
  }

  /**
   * Get the list mapstyle sets linked to the organisation
   * @returns {SimpleResourceProxy} - A proxy for accessing the resource
   */
  get mapstyleSets() {
    return this._proxyBuilder(MapstyleSet);
  }

  /**
   * Get the list svg sets linked to the organisation
   * @returns {SimpleResourceProxy} - A proxy for accessing the resource
   */
  get svgSets() {
    return this._proxyBuilder(SvgSet);
  }

  /**
   * Get the list colors linked to the organisation
   * @returns {SimpleResourceProxy} - A proxy for accessing the resource
   */
  get colors() {
    return this._proxyBuilder(Color);
  }

  /**
   * Get the list features linked to the organisation
   * @returns {SimpleResourceProxy} - A proxy for accessing the resource
   */
  get features() {
    return this._proxyBuilder(Feature);
  }

  /**
   * Get the list layers linked to the organisation
   * @returns {SimpleResourceProxy} - A proxy for accessing the resource
   */
  get layers() {
    return this._proxyBuilder(Layer);
  }

  /**
   * Get the list job types linked to the organisation
   * @returns {SimpleResourceProxy} - A proxy for accessing the resource
   */
  get jobTypes() {
    return this._proxyBuilder(JobType);
  }

  /**
   * Get the list job shares linked to the organisation
   * @returns {SimpleResourceProxy} - A proxy for accessing the resource
   */
  get jobShares() {
    return this._proxyBuilder(JobShare);
  }

  /**
   * Get the list users linked to the organisation
   * @returns {SimpleResourceProxy} - A proxy for accessing the resource
   */
  get users() {
    return this._proxyBuilder(User);
  }

  /**
   * Get the list contracts linked to the organisation
   * @returns {SimpleResourceProxy} - A proxy for accessing the resource
   */
  get contracts() {
    return this._proxyBuilder(Contract);
  }

  /**
   * Builds OwnedResourceProxy instance
   * @param {constructor} Target - target class
   * @returns {OwnedResourceProxy} - proxy instance
   * @private
   */
  _proxyBuilder(Target) {
    return new OwnedResourceProxy(this.api, this, Target);
  }
}
