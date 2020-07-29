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

import OwnedResourceProxy from '../proxy/OwnedResourceProxy';
import ResourceProxy from '../proxy/ResourceProxy';
import CrudBase from './base/CrudBase';
import Color from './Color';
import Dimension from './Dimension';
import DimensionSet from './DimensionSet';
import Feature from './Feature';
import Font from './Font';
import FontFamily from './FontFamily';
import Job from './Job';
import JobShare from './JobShare';
import JobType from './JobType';
import Language from './Language';
import Layer from './Layer';
import Mapstyle from './Mapstyle';
import MapstyleSet from './MapstyleSet';
import Notification from './Notification';
import Organisation from './Organisation';
import Permission from './Permission';
import Role from './Role';
import Svg from './Svg';
import SvgSet from './SvgSet';

export default class User extends CrudBase {
  static get resourceName () {
    return 'users';
  }

  /**
   * Get all known ips
   * @returns {Promise<string[]>} - List of ip addresses
   * @throws {ApiError}
   */
  async ips () {
    const url = `${this.url}/ips`;
    const { data } = await this.api.ky.get(url).json();

    return data.map(row => row['ip_address']);
  }

  /**
   * Get the user's organisation
   * @returns {Promise<Organisation>} - user's organisation
   * @throws {ApiError}
   */
  organisation () {
    return new ResourceProxy(this.api, Organisation).get(this.organisationId);
  }

  /**
   * Get the user's language
   * @returns {Promise<Language>} - user's language
   * @throws {ApiError}
   */
  language () {
    return new ResourceProxy(this.api, Language).get(this.languageCode);
  }

  // region Resource listing
  /**
   * Get the list notifications linked to the user
   * @returns {SimpleResourceProxy} - A proxy for accessing the resource
   */
  get notifications () {
    return this._proxyResourceList(Notification);
  }

  /**
   * Get the list mapstyle sets linked to the user
   * @returns {SimpleResourceProxy} - A proxy for accessing the resource
   */
  get mapstyleSets () {
    return this._proxyResourceList(MapstyleSet);
  }

  /**
   * Get the list mapstyles linked to the user
   * @returns {SimpleResourceProxy} - A proxy for accessing the resource
   */
  get mapstyles () {
    return this._proxyResourceList(Mapstyle);
  }

  /**
   * Get the list dimension sets linked to the user
   * @returns {SimpleResourceProxy} - A proxy for accessing the resource
   */
  get dimensionSets () {
    return this._proxyResourceList(DimensionSet);
  }

  /**
   * Get the list dimensions linked to the user
   * @returns {SimpleResourceProxy} - A proxy for accessing the resource
   */
  get dimensions () {
    return this._proxyResourceList(Dimension);
  }

  /**
   * Get the list font families linked to the user
   * @returns {SimpleResourceProxy} - A proxy for accessing the resource
   */
  get fontFamilies () {
    return this._proxyResourceList(FontFamily);
  }

  /**
   * Get the list fonts linked to the user
   * @returns {SimpleResourceProxy} - A proxy for accessing the resource
   */
  get fonts () {
    return this._proxyResourceList(Font);
  }

  /**
   * Get the list svg sets linked to the user
   * @returns {SimpleResourceProxy} - A proxy for accessing the resource
   */
  get svgSets () {
    return this._proxyResourceList(SvgSet);
  }

  /**
   * Get the list svgs linked to the user
   * @returns {SimpleResourceProxy} - A proxy for accessing the resource
   */
  get svgs () {
    return this._proxyResourceList(Svg);
  }

  /**
   * Get the list colors linked to the user
   * @returns {SimpleResourceProxy} - A proxy for accessing the resource
   */
  get colors () {
    return this._proxyResourceList(Color);
  }

  /**
   * Get the list jobs linked to the user
   * @returns {SimpleResourceProxy} - A proxy for accessing the resource
   */
  get jobs () {
    return this._proxyResourceList(Job);
  }

  /**
   * Get the list features linked to the user
   * @returns {SimpleResourceProxy} - A proxy for accessing the resource
   */
  get features () {
    return this._proxyResourceList(Feature);
  }

  /**
   * Get the list layers linked to the user
   * @returns {SimpleResourceProxy} - A proxy for accessing the resource
   */
  get layers () {
    return this._proxyResourceList(Layer);
  }

  /**
   * Get the list job types linked to the user
   * @returns {SimpleResourceProxy} - A proxy for accessing the resource
   */
  get jobTypes () {
    return this._proxyResourceList(JobType);
  }

  /**
   * Get the list job shares linked to the user
   * @returns {SimpleResourceProxy} - A proxy for accessing the resource
   */
  get jobShares () {
    return this._proxyResourceList(JobShare);
  }

  /**
   * Get the list permissions linked to the user
   * @returns {SimpleResourceProxy} - A proxy for accessing the resource
   */
  get permissions () {
    return this._proxyResourceList(Permission);
  }

  /**
   * Get the list roles linked to the user
   * @returns {OwnedResourceProxy} - A proxy for accessing the resource
   */
  get roles () {
    return new OwnedResourceProxy(this.api, this, Role);
  }

  // endregion
}
