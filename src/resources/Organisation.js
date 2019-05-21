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

import OwnedResourceProxy from '../proxy/OwnedResourceProxy';
import CrudBase from './base/CrudBase';
import Color from './Color';
import Contract from './Contract';
import DimensionSet from './DimensionSet';
import Domain from './Domain';
import Feature from './Feature';
import FontFamily from './FontFamily';
import Job from './Job';
import JobShare from './JobShare';
import JobType from './JobType';
import Layer from './Layer';
import MapstyleSet from './MapstyleSet';
import SvgSet from './SvgSet';
import Tag from './Tag';
import User from './User';


export default class Organisation extends CrudBase {
  static get resourceName () {
    return 'organisations';
  }

  // Resource listing
  /**
   * Get a proxy for font families linked to the organisation
   * @returns {OwnedResourceProxy} - A proxy for accessing the resource
   */
  get fontFamilies () {
    return new OwnedResourceProxy(this.api, this, FontFamily);
  }

  /**
   * Get a proxy for dimension sets linked to the organisation
   * @returns {OwnedResourceProxy} - A proxy for accessing the resource
   */
  get dimensionSets () {
    return new OwnedResourceProxy(this.api, this, DimensionSet);
  }

  /**
   * Get a proxy for mapstyle sets linked to the organisation
   * @returns {OwnedResourceProxy} - A proxy for accessing the resource
   */
  get mapstyleSets () {
    return new OwnedResourceProxy(this.api, this, MapstyleSet);
  }

  /**
   * Get a proxy for svg sets linked to the organisation
   * @returns {OwnedResourceProxy} - A proxy for accessing the resource
   */
  get svgSets () {
    return new OwnedResourceProxy(this.api, this, SvgSet);
  }

  /**
   * Get a proxy for colors linked to the organisation
   * @returns {OwnedResourceProxy} - A proxy for accessing the resource
   */
  get colors () {
    return new OwnedResourceProxy(this.api, this, Color);
  }

  /**
   * Get a proxy for tags linked to the organisation
   * @returns {OwnedResourceProxy} - A proxy for accessing the resource
   */
  get tags () {
    return new OwnedResourceProxy(this.api, this, Tag);
  }

  /**
   * Get a proxy for features linked to the organisation
   * @returns {OwnedResourceProxy} - A proxy for accessing the resource
   */
  get features () {
    return new OwnedResourceProxy(this.api, this, Feature);
  }

  /**
   * Get a proxy for layers linked to the organisation
   * @returns {OwnedResourceProxy} - A proxy for accessing the resource
   */
  get layers () {
    return new OwnedResourceProxy(this.api, this, Layer);
  }

  /**
   * Get a proxy for jobs linked to the organisation, also known as company maps
   * @returns {SimpleResourceProxy} - A proxy for accessing the resource
   */
  get jobs () {
    return this._proxyResourceList(Job);
  }

  /**
   * Get a proxy for job types linked to the organisation
   * @returns {OwnedResourceProxy} - A proxy for accessing the resource
   */
  get jobTypes () {
    return new OwnedResourceProxy(this.api, this, JobType);
  }

  /**
   * Get a proxy for job shares linked to the organisation
   * @returns {SimpleResourceProxy} - A proxy for accessing the resource
   */
  get jobShares () {
    return this._proxyResourceList(JobShare);
  }

  /**
   * Get a proxy for users linked to the organisation
   * @returns {SimpleResourceProxy} - A proxy for accessing the resource
   */
  get users () {
    return this._proxyResourceList(User);
  }

  /**
   * Get a proxy for contracts linked to the organisation
   * @returns {SimpleResourceProxy} - A proxy for accessing the resource
   */
  get contracts () {
    return this._proxyResourceList(Contract);
  }

  /**
   * Get a proxy for contracts linked to the organisation
   * @returns {SimpleResourceProxy} - A proxy for accessing the resource
   */
  get domains () {
    return this._proxyResourceList(Domain);
  }

  /**
   * Get a tree representation of the organisation's relationships
   * @returns {Promise<Array<Organisation>>} - List of organisation root nodes. Organisations contain an extra property called "children"
   * @example
   * function printTree(nodes, prefix = '-') {
   *  for (const node of nodes) {
   *    console.log(`${prefix} ${node.name}`);
   *
   *    printTree(node.children, prefix + '-');
   *  }
   * }
   *
   * organisation.getTree().then(printTree)
   */
  async getTree () {
    const { data: { data } } = await this.api.axios.get(`${this.url}/tree`);

    return data.map(root => this._parseTree(root));
  }

  _parseTree (rawNode) {
    const node = new this.constructor(this._api, rawNode);

    node.children = node.children.map(child => this._parseTree(child));

    return node;
  }
}
