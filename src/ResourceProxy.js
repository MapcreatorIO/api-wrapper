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
 */
export default class ResourceProxy {
  /**
   * @param {Maps4News} api - Instance of the api
   * @param {ResourceBase} Target - Target to wrap
   */
  constructor(api, Target) {
    if (!isParentOf(ResourceBase, Target)) {
      throw new TypeError('Target is not a child of ResourceBase');
    }

    if (typeof Target !== 'function') {
      throw new TypeError('Target must to be a class not an instance');
    }

    this._api = api;
    this._Target = Target;
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
   */
  get accessorName() {
    return this.Target.name.toLowerCase();
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
   */
  search(query, page = 1, perPage = this.api.defaults.perPage) {
    const url = this.new().baseUrl;
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
   * @param {Boolean} cacheEnabled - If the pagination cache should be used
   * @param {Number} cacheTime - Amount of seconds to store a value in cache
   * @param {Boolean} shareCache - Share cache across instances
   * @returns {PaginatedResourceWrapper} - Resolves with {@link PaginatedResourceListing} instance and rejects with {@link ApiError}
   *
   */
  listAndWrap(page = 1, perPage = this.api.defaults.perPage, cacheEnabled = this.api.defaults.cacheEnabled, cacheTime = this.api.defaults.cacheSeconds, shareCache = this.api.defaults._shareCache) {
    return this.searchAndWrap({}, page, perPage, cacheEnabled, cacheTime, shareCache);
  }

  /**
   * Lists target resource
   * @param {Object<String, String|Array<String>>} query - Query
   * @param {Number} page - The page to be requested
   * @param {Number} perPage - Amount of items per page. This is silently capped by the API
   * @param {Boolean} cacheEnabled - If the pagination cache should be used
   * @param {Number} cacheTime - Amount of seconds to store a value in cache
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
  searchAndWrap(query, page = 1, perPage = this.api.defaults.perPage, cacheEnabled = this.api.defaults.cacheEnabled, cacheTime = this.api.defaults.cacheSeconds, shareCache = this.api.defaults._shareCache) {
    const url = this.new().baseUrl;
    const resolver = new PaginatedResourceListing(this._api, url, this.Target, query, page, perPage);
    const wrapped = resolver.wrap(cacheEnabled, cacheTime, shareCache);

    wrapped.get(page);

    return wrapped;
  }

  /**
   * Get target resource
   * @param {Number|String} [id=] - The resource id to be requested
   * @returns {Promise} - Resolves with {@link ResourceBase} instance and rejects with {@link ApiError}
   */
  get(id) {
    const data = typeof id === 'undefined' ? {} : {id};
    const url = this.new(data).url;

    return new Promise((resolve, reject) => {
      this._api
        .request(url)
        .catch(reject)
        .then(data => resolve(this.new(data)));
    });
  }

  /**
   * Select target resource without obtaining data
   * @param {Number|String} [id=] - Resource id
   * @returns {ResourceBase} - Empty target resource
   * @example
   * api.users.select('me').colors().then(doSomethingCool);
   */
  select(id) {
    const data = typeof id === 'undefined' ? {} : {id};

    return this.new(data);
  }

  /**
   * Build a new isntance of the target
   * @param {Object<String, *>} data - Data for the object to be populated with
   * @returns {ResourceBase} - Resource with target data
   */
  new(data = {}) {
    return new this.Target(this._api, data);
  }
}
