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

import ResourceBase from './crud/base/ResourceBase';
import PaginatedResourceListing from './PaginatedResourceListing';
import {isParentOf} from './utils/reflection';

/**
 * Proxy for accessing resource. This will make sure that they
 * are properly wrapped before the promise resolves.
 * @protected
 * @todo remove ::search* in favor of an object containing function parameters
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
   * Lists target resource
   * @param {Object<String, String|Array<String>>} query - Query
   * @param {Number} page - The page to be requested
   * @param {Number} perPage - Amount of items per page. This is silently capped by the API
   * @returns {Promise} - Resolves with {@link PaginatedResourceListing} instance and rejects with {@link ApiError}
   *
   * @example
   * // Find layers with a name that starts with "test" and a scale_min between 1 and 10
   * // See Api documentation for search query syntax
   * var query = {
   *   name: '^:test',
   *   scale_min: ['>:1', '<:10'],
   * }
   *
   * api.layers.search(query).then(console.dir);
   * @todo move page, perPage, etc. to an object and add other options
   */
  search(query, page = 1, perPage = this.api.defaults.perPage) {
    const url = this._baseUrl;
    const resolver = new PaginatedResourceListing(this._api, url, this.Target, query);

    return resolver.getPage(page, perPage);
  }

  /**
   * Lists target resource
   * @param {Number} page - The page to be requested
   * @param {Number|undefined} perPage - Amount of items per page. This is silently capped by the API
   * @returns {Promise} - Resolves with {@link PaginatedResourceListing} instance and rejects with {@link ApiError}
   */
  list(page = 1, perPage = this.api.defaults.perPage) {
    return this.search({}, page, perPage);
  }

  /**
   * Lists target resource
   * @param {Number} page - The page to be requested
   * @param {Number} perPage - Amount of items per page. This is silently capped by the API
   * @param {Boolean} shareCache - Share cache across instances
   * @returns {PaginatedResourceWrapper} - Resolves with {@link PaginatedResourceListing} instance and rejects with {@link ApiError}
   *
   */
  listAndWrap(page = 1, perPage = this.api.defaults.perPage, shareCache = this.api.defaults._shareCache) {
    return this.searchAndWrap({}, page, perPage, shareCache);
  }

  /**
   * Lists target resource
   * @param {Object<String, String|Array<String>>} query - Query
   * @param {Number} page - The page to be requested
   * @param {Number} perPage - Amount of items per page. This is silently capped by the API
   * @param {Boolean} shareCache - Share cache across instances
   * @returns {PaginatedResourceWrapper} - Wrapped {@link PaginatedResourceListing} instance
   *
   * @example
   * // Find layers with a name that starts with "test" and a scale_min between 1 and 10
   * // See Api documentation for search query syntax
   * var query = {
   *   name: '^:test',
   *   scale_min: ['>:1', '<:10'],
   * }
   *
   * api.layers.searchAndWrap(query)
   */
  searchAndWrap(query, page = 1, perPage = this.api.defaults.perPage, shareCache = this.api.defaults._shareCache) {
    const url = this._baseUrl;
    const resolver = new PaginatedResourceListing(this._api, url, this.Target, query, page, perPage);
    const wrapped = resolver.wrap(shareCache);

    wrapped.get(page);

    return wrapped;
  }

  /**
   * Build a new isntance of the target
   * @param {Object<String, *>} data - Data for the object to be populated with
   * @returns {ResourceBase} - Resource with target data
   */
  new(data = {}) {
    // Merge but don't overwrite using seed data
    data = Object.assign(this._seedData, data);

    return new this.Target(this._api, data);
  }

  /**
   * List target resource
   * @param {Number|Object} params - ParametersThe page to be requested
   * @param {Number} [params.page=1] - The page to be requested
   * @param {Number} [params.perPage=this.api.defaults.perPage] - Amount of items per page. This is silently capped by the API
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
  newList(params) {
    Object.assign(params, this.defaultParams);
    return this._buildResolver(params).getPage(params.page);
  }

  /**
   * List target resource
   * @param {Number|Object} params - ParametersThe page to be requested
   * @param {Number} [params.page=1] - The page to be requested
   * @param {Number} [params.perPage=this.api.defaults.perPage] - Amount of items per page. This is silently capped by the API
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
   * api.layers.list({perPage: 10, search});
   */
  newListAndWrap(params) {
    Object.assign(params, this.defaultParams);

    const wrapped = this._buildResolver(params).wrap(params.page);

    wrapped.get(params.page);
    return wrapped;
  }

  _buildResolver(params) {
    const paramType = typeof params;
    const url = this._baseUrl;

    if (!['number', 'object'].includes(paramType)) {
      throw new TypeError(`Expected params to be of type number or object. Got "${paramType}"`);
    }

    if (paramType === 'number') {
      return this.newList({page: params});
    }

    return new PaginatedResourceListing(this._api, url, this.Target, params.search, params.page, params.perPage);
  }

  get defaultParams() {
    const defaults = this.api.defaults;

    return {
      page: 1,
      perPage: defaults.perPage,
      shareCache: defaults.shareCache,
      search: {},
    };
  }
}
