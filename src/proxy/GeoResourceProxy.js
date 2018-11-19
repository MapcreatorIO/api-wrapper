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

import GeoError from '../errors/GeoError';
import RequestParameters from '../RequestParameters';
import {GeoBoundary, GeoPoint} from '../utils/geo';
import ResourceProxy from './ResourceProxy';

export default class GeoResourceProxy extends ResourceProxy {
  /**
   * @param {Maps4News} api - Instance of the api
   * @param {ResourceBase} Target - Target to wrap
   * @param {?string} [altUrl=null] - Internal use, Optional alternative url for more complex routing
   * @param {object} seedData - Internal use, used for seeding ::new
   * @param {object} options - instance options
   * @param {boolean} [options.hasForPoint=true] - If the endpoint supports for-point
   * @param {boolean} [options.hasForBoundary=true] - If the endpoint supports for-boundary
   */
  constructor(api, Target, altUrl = null, seedData = {}, {hasForPoint = true, hasForBoundary = true}) {
    super(api, Target, altUrl, seedData);
    this._hasForPoint = hasForPoint;
    this._hasForBoundary = hasForBoundary;
  }

  /**
   * If the proxy supports for-point operations
   * @returns {boolean} - If it supports the operations
   */
  get hasForPoint() {
    return this._hasForPoint;
  }

  /**
   * If the proxy supports for-point operations
   * @returns {boolean} - If it supports the operations
   */
  get hasForBoundary() {
    return this._hasForBoundary;
  }

  // noinspection JSCommentMatchesSignature
  /**
   * Get an array of results for boundary
   * @param {Object} boundary - boundary to search within
   * @param {Object} boundary.topLeft - top left corner of the boundary
   * @param {Number} boundary.topLeft.lat - top left corner latitude
   * @param {Number} boundary.topLeft.lng - top left corner longitude
   * @param {Object} boundary.bottomRight - bottom right corner of the boundary
   * @param {Number} boundary.bottomRight.lat - bottom right corner latitude
   * @param {Number} boundary.bottomRight.lng - bottom right corner longitude
   * @param {Number} limit - maximum amount of results, can't be larger then RequestParameters.maxPerPage
   * @returns {Promise<ResourceBase[]>} - target resource for boundary
   * @throws TypeError
   * @throws GeoError
   */
  async forBoundary({topLeft, bottomRight}, limit = RequestParameters.perPage) {
    if (!this.hasForBoundary) {
      throw new GeoError(`${this.Target.name} does not support the operation forBoundary`);
    }
    const boundary = new GeoBoundary(topLeft, bottomRight);

    if (limit > RequestParameters.maxPerPage) {
      throw new TypeError(`Invalid resource limit ${limit}, maximum allowed is ${RequestParameters.maxPerPage}`);
    }

    const url = this.new().baseUrl + '/for-bounds';

    const data = await this.api.request(url, 'POST', {limit, ...boundary});

    return data.map(r => this.new(r));
  }

  // noinspection JSCommentMatchesSignature
  /**
   * Get an array of results for point
   * @param {Object} point - point to search at
   * @param {Number} point.lat - top left corner latitude
   * @param {Number} point.lng - top left corner longitude
   * @param {Number} limit - maximum amount of results, can't be larger then RequestParameters.maxPerPage
   * @returns {Promise<ResourceBase[]>} - target resource for boundary
   * @throws TypeError
   * @throws GeoError
   */
  async forPoint({lat, lng}, limit = RequestParameters.perPage) {
    if (!this.hasForPoint) {
      throw new GeoError(`${this.Target.name} does not support the operation forPoint`);
    }

    const point = new GeoPoint(lat, lng);

    if (limit > RequestParameters.maxPerPage) {
      throw new TypeError(`Invalid resource limit ${limit}, maximum allowed is ${RequestParameters.maxPerPage}`);
    }

    const url = this.new().baseUrl + '/for-point';

    const data = await this.api.request(url, 'POST', {limit, point});

    return data.map(r => this.new(r));
  }
}
