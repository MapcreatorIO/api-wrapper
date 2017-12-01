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

import ResourceBase from '../resources/base/ResourceBase';
import PaginatedResourceListing from '../PaginatedResourceListing';
import {isParentOf} from '../utils/reflection';
import RequestParameters from '../RequestParameters';

/**
 * Proxy for accessing resource. This will make sure that they
 * are properly wrapped before the promise resolves.
 * @protected
 */
export default class SimpleResourceProxy {
  /**
   * @param {Maps4News} api - Instance of the api
   * @param {ResourceBase} Target - Target to wrap
   * @param {?string} [altUrl=null] - Internal use, Optional alternative url for more complex routing
   * @param {object} seedData - Internal use, used for seeding ::new
   */
  constructor(api, Target, altUrl = null, seedData = {}) {
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

  get _baseUrl() {
    if (!this.__baseUrl) {
      this.__baseUrl = this.new().baseUrl;
    }

    return this.__baseUrl;
  }

  /**
   * Get api instance
   * @returns {Maps4News} - Api instance
   */
  get api() {
    return this._api;
  }

  /**
   * Target to wrap results in
   * @returns {ResourceBase} - Target constructor
   * @constructor
   */
  get Target() {
    return this._Target;
  }

  /**
   * The name of the target
   * @returns {String} - Target name
   * @example
   * api.colors.accessorName === 'Color'
   * api.fontFamilies.accessorName = 'Font Families'
   */
  get accessorName() {
    return this.Target.name.replace(/([A-Z])/g, x => ' ' + x).trim();
  }

  /**
   * Build a new instance of the target
   * @param {Object<String, *>} data - Data for the object to be populated with
   * @returns {ResourceBase} - Resource with target data
   */
  new(data = {}) {
    // Merge but don't overwrite using seed data
    data = Object.assign({}, this._seedData, data);

    return new this.Target(this._api, data);
  }

  /**
   * List target resource
   * @param {Number|Object|RequestParameters} [params] - Parameters or the page number to be requested
   * @param {Number} [params.page=1] - The page to be requested
   * @param {Number} [params.perPage=this.api.defaults.perPage] - Amount of items per page. This is silently capped by the API
   * @param {Number} [params.sort=''] - Amount of items per page. This is silently capped by the API
   * @param {Number} [params.deleted=this.api.defaults.showDeleted] - Show deleted resources, posible values: only, none, all
   * @param {?Object<String, String|Array<String>>} [params.search] - Search parameters
   * @returns {Promise} - Resolves with {@link PaginatedResourceListing} instance and rejects with {@link ApiError}
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
  list(params = {}) {
    const resolver = this._buildResolver(params);

    return resolver.getPage(resolver.page);
  }

  /**
   * List target resource
   * @param {Number|Object|RequestParameters} [params] - Parameters or the page to be requested
   * @param {Number} [params.page=1] - The page to be requested
   * @param {Number} [params.perPage=this.api.defaults.perPage] - Amount of items per page. This is silently capped by the API
   * @param {Array<String>|string} [params.sort=''] - Comma separated list or array
   * @param {String} [params.deleted=this.api.defaults.showDeleted] - Show deleted resources, posible values: only, none, all
   * @param {Boolean} [params.shareCache=this.api.defaults.shareCache] - Share cache across instances
   * @param {?Object<String, String|Array<String>>} [params.search] - Search parameters
   * @returns {PaginatedResourceWrapper} - Wrapped paginated resource
   * @example
   * // Find layers with a name that starts with "test" and a scale_min between 1 and 10
   * // See Api documentation for search query syntax
   * const search = {
   *   name: '^:test',
   *   scale_min: ['>:1', '<:10'],
   * };
   *
   * api.layers.listandWrap({perPage: 10, search});
   */
  listAndWrap(params = {}) {
    const resolver = this._buildResolver(params);
    const wrapped = resolver.wrap(resolver.page);

    wrapped.get(resolver.page);
    return wrapped;
  }

  _buildResolver(params = {}) {
    const paramType = typeof params;
    const url = this._baseUrl;

    if (!['number', 'object'].includes(paramType)) {
      throw new TypeError(`Expected params to be of type number or object. Got "${paramType}"`);
    }

    if (paramType === 'number') {
      return this._buildResolver({page: params});
    }

    if (!(params instanceof RequestParameters)) {
      params = new RequestParameters(params);
    }

    return new PaginatedResourceListing(this._api, url, this.Target, params);
  }
}
