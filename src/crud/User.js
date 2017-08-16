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

import ResourceProxy from '../ResourceProxy';
import CrudBase from './base/CrudBase';
import Color from './Color';
import DimensionSet from './DimensionSet';
import Feature from './Feature';
import FontFamily from './FontFamily';
import Job from './Job';
import JobShare from './JobShare';
import JobType from './JobType';
import Language from './Language';
import Layer from './Layer';
import MapstyleSet from './MapstyleSet';
import Notification from './Notification';
import Organisation from './Organisation';
import Permission from './Permission';
import SvgSet from './SvgSet';

export default class User extends CrudBase {
  get resourceName() {
    return 'users';
  }

  /**
   * Get all known ips
   * @returns {Promise} - Resolves with {@link array<string>} instance and rejects with {@link ApiError}
   */
  ips() {
    const url = `${this.url}/ips`;

    return new Promise((resolve, reject) => {
      this.api.request(url)
        .catch(reject)
        .then(data => resolve(
          data.map(row => row['ip_address']),
        ));
    });
  }

  /**
   * Get the user's organisation
   * @returns {Promise} - Resolves with {@link Organisation} instance and rejects with {@link ApiError}
   */
  organisation() {
    return (new ResourceProxy(this.api, Organisation)).get(this.organisationId);
  }

  /**
   * Get the user's language
   * @returns {Promise} - Resolves with {@link Language} instance and rejects with {@link ApiError}
   */
  language() {
    return (new ResourceProxy(this.api, Language)).get(this.languageCode);
  }

  // region Resource listing
  /**
   * Get the list notifications linked to the user
   * @returns {SimpleResourceProxy} - A proxy for accessing the resource
   */
  get notifications() {
    return this._proxyResourceList(Notification);
  }

  /**
   * Get the list mapstyle sets linked to the user
   * @returns {SimpleResourceProxy} - A proxy for accessing the resource
   */
  get mapstyleSets() {
    return this._proxyResourceList(MapstyleSet);
  }

  /**
   * Get the list dimension sets linked to the user
   * @returns {SimpleResourceProxy} - A proxy for accessing the resource
   */
  get dimensionSets() {
    return this._proxyResourceList(DimensionSet);
  }

  /**
   * Get the list font families linked to the user
   * @returns {SimpleResourceProxy} - A proxy for accessing the resource
   */
  get fontFamilies() {
    return this._proxyResourceList(FontFamily);
  }

  /**
   * Get the list svg sets linked to the user
   * @returns {SimpleResourceProxy} - A proxy for accessing the resource
   */
  get svgSets() {
    return this._proxyResourceList(SvgSet);
  }

  /**
   * Get the list colors linked to the user
   * @returns {SimpleResourceProxy} - A proxy for accessing the resource
   */
  get colors() {
    return this._proxyResourceList(Color);
  }

  /**
   * Get the list jobs linked to the user
   * @returns {SimpleResourceProxy} - A proxy for accessing the resource
   */
  get jobs() {
    return this._proxyResourceList(Job);
  }

  /**
   * Get the list features linked to the user
   * @returns {SimpleResourceProxy} - A proxy for accessing the resource
   */
  get features() {
    return this._proxyResourceList(Feature);
  }

  /**
   * Get the list layers linked to the user
   * @returns {SimpleResourceProxy} - A proxy for accessing the resource
   */
  get layers() {
    return this._proxyResourceList(Layer);
  }

  /**
   * Get the list job types linked to the user
   * @returns {SimpleResourceProxy} - A proxy for accessing the resource
   */
  get jobTypes() {
    return this._proxyResourceList(JobType);
  }

  /**
   * Get the list job shares linked to the user
   * @returns {SimpleResourceProxy} - A proxy for accessing the resource
   */
  get jobShares() {
    return this._proxyResourceList(JobShare);
  }

  /**
   * Get the list job shares linked to the user
   * @returns {SimpleResourceProxy} - A proxy for accessing the resource
   */
  get permissions() {
    return this._proxyResourceList(Permission);
  }

  // endregion
}
