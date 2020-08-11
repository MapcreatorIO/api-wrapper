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

import PaginatedResourceListing from '../PaginatedResourceListing';
import RequestParameters from '../RequestParameters';
import ResourceLister from '../ResourceLister';
import ResourceBase from '../resources/base/ResourceBase';
import { isParentOf } from '../utils/reflection';

/**
 * Proxy for accessing resource. This will make sure that they
 * are properly wrapped before the promise resolves.
 * @protected
 */
export default class SimpleResourceProxy {
  /**
   * @param {Mapcreator} api - Instance of the api
   * @param {Class<ResourceBase>} Target - Target to wrap
   * @param {?string} [altUrl=null] - Internal use, Optional alternative url for more complex routing
   * @param {object} seedData - Internal use, used for seeding ::new
   */
  constructor (api, Target, altUrl = null, seedData = {}) {
    if (!isParentOf(ResourceBase, Target)) {
      throw new TypeError('Target is not a child of ResourceBase');
    }

    if (typeof Target !== 'function') {
      throw new TypeError('Target must to be a class not an instance');
    }

    if (altUrl) {
      this.__baseUrl = altUrl;
    }

    this._api = api;
    this._Target = Target;
    this._seedData = seedData;
  }

  /**
   * Proxy target url
   * @returns {string} url
   * @example
   * api.layers.select(100).organisations.baseUrl === "https://maponline-api.dev/v1/layers/100/organisations"
   */
  get baseUrl () {
    if (!this.__baseUrl) {
      this.__baseUrl = this.new().baseUrl;
    }

    return this.__baseUrl;
  }

  /**
   * Get api instance
   * @returns {Mapcreator} - Api instance
   */
  get api () {
    return this._api;
  }

  /**
   * Target to wrap results in
   * @returns {Class<ResourceBase>} - Target constructor
   */
  get Target () {
    return this._Target;
  }

  /**
   * Build a new instance of the target
   * @param {Object<String, *>} data - Data for the object to be populated with
   * @returns {ResourceBase} - Resource with target data
   */
  new (data = {}) {
    // Merge but don't overwrite using seed data
    data = { ...this._seedData, ...data };

    return new this.Target(this._api, data);
  }

  /**
   * List target resource
   * @param {Number|Object|RequestParameters} [params] - Parameters or the page number to be requested
   * @param {Number} [params.page=1] - The page to be requested
   * @param {Number} [params.perPage=RequestParameters.perPage] - Amount of items per page. This is silently capped by the API
   * @param {String|String[]} [params.sort=''] - Amount of items per page. This is silently capped by the API
   * @param {String} [params.deleted=RequestParameters.deleted] - Show deleted resources, posible values: only, none, all
   * @param {?Object<String, String|Array<String>>} [params.search] - Search parameters
   * @returns {CancelablePromise<PaginatedResourceListing>} - paginated resource
   * @throws {ApiError} - If the api returns errors
   * @example
   * // Find layers with a name that starts with "test" and a scale_min between 1 and 10
   * // See Api documentation for search query syntax
   * const search = {
   *   name: '^:test',
   *   scale_min: ['>:1', '<:10'],
   * };
   *
   * api.layers.list({perPage: 10, search});
   */
  list (params = {}) {
    const resolver = this._buildResolver(params);

    return resolver.getPage(resolver.page);
  }

  /**
   * Get the resource lister
   *
   * @param {object|RequestParameters} parameters - parameters
   * @param {number} maxRows - Maximum amount of rows
   * @returns {ResourceLister} - Resource lister
   */
  lister (parameters = {}, maxRows = 50) {
    return new ResourceLister(this.api, this.baseUrl, this.Target, parameters, maxRows, this.Target.resourceUrlKey);
  }

  // @todo disabled for now due to it promoting bad practices
  // /**
  //  * Get all the resources
  //  * Please note that you might hit the rate limiter if you use this method. Make sure to cache it's result.
  //  *
  //  * @param {object|RequestParameters} parameters - parameters
  //  * @returns {Promise<ResourceBase[]>} - All the resources
  //  * @throws {ApiError} - If the api returns errors
  //  */
  // async all(parameters = {}) {
  //   const page = await this.list(parameters);
  //   const promises = [];
  //
  //   for (let i = 2; i <= page.pageCount; i++) {
  //     promises.push(page.getPage(i));
  //   }
  //
  //   const results = await Promise.all(promises);
  //
  //   return results.reduce((a, v) => a.concat(v.data), [...page.data]);
  // }

  _buildResolver (params = {}) {
    const paramType = typeof params;
    const url = this.baseUrl;

    if (!['number', 'object'].includes(paramType)) {
      throw new TypeError(`Expected params to be of type number or object. Got "${paramType}"`);
    }

    if (paramType === 'number') {
      return this._buildResolver({ page: params });
    }

    if (!(params instanceof RequestParameters)) {
      params = new RequestParameters(params);
    }

    return new PaginatedResourceListing(this._api, url, this.Target, params);
  }
}
