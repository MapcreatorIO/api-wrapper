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
import Tag from './Tag';
import User from './User';
import OwnedResourceProxy from '../proxy/OwnedResourceProxy';
import Domain from './Domain';


export default class Organisation extends CrudBase {
  get resourceName() {
    return 'organisations';
  }

  // Resource listing
  /**
   * Get a proxy for font families linked to the organisation
   * @returns {OwnedResourceProxy} - A proxy for accessing the resource
   */
  get fontFamilies() {
    return this._proxyBuilder(FontFamily);
  }

  /**
   * Get a proxy for dimension sets linked to the organisation
   * @returns {OwnedResourceProxy} - A proxy for accessing the resource
   */
  get dimensionSets() {
    return this._proxyBuilder(DimensionSet);
  }

  /**
   * Get a proxy for mapstyle sets linked to the organisation
   * @returns {OwnedResourceProxy} - A proxy for accessing the resource
   */
  get mapstyleSets() {
    return this._proxyBuilder(MapstyleSet);
  }

  /**
   * Get a proxy for svg sets linked to the organisation
   * @returns {OwnedResourceProxy} - A proxy for accessing the resource
   */
  get svgSets() {
    return this._proxyBuilder(SvgSet);
  }

  /**
   * Get a proxy for colors linked to the organisation
   * @returns {OwnedResourceProxy} - A proxy for accessing the resource
   */
  get colors() {
    return this._proxyBuilder(Color);
  }

  /**
   * Get a proxy for tags linked to the organisation
   * @returns {OwnedResourceProxy} - A proxy for accessing the resource
   */
  get tags() {
    return this._proxyBuilder(Tag);
  }

  /**
   * Get a proxy for features linked to the organisation
   * @returns {OwnedResourceProxy} - A proxy for accessing the resource
   */
  get features() {
    return this._proxyBuilder(Feature);
  }

  /**
   * Get a proxy for layers linked to the organisation
   * @returns {OwnedResourceProxy} - A proxy for accessing the resource
   */
  get layers() {
    return this._proxyBuilder(Layer);
  }

  /**
   * Get a proxy for job types linked to the organisation
   * @returns {OwnedResourceProxy} - A proxy for accessing the resource
   */
  get jobTypes() {
    return this._proxyBuilder(JobType);
  }

  /**
   * Get a proxy for job shares linked to the organisation
   * @returns {SimpleResourceProxy} - A proxy for accessing the resource
   */
  get jobShares() {
    return this._proxyResourceList(JobShare);
  }

  /**
   * Get a proxy for users linked to the organisation
   * @returns {SimpleResourceProxy} - A proxy for accessing the resource
   */
  get users() {
    return this._proxyResourceList(User);
  }

  /**
   * Get a proxy for contracts linked to the organisation
   * @returns {SimpleResourceProxy} - A proxy for accessing the resource
   */
  get contracts() {
    return this._proxyResourceList(Contract);
  }

  /**
   * Get a proxy for contracts linked to the organisation
   * @returns {SimpleResourceProxy} - A proxy for accessing the resource
   */
  get domains() {
    return this._proxyResourceList(Domain);
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
