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

import Maps4News from './Maps4News';
import PaginatedResourceWrapper from './PaginatedResourceWrapper';
import {getTypeName, isParentOf} from './utils/reflection';
import {encodeQueryString} from './utils/requests';

/**
 * Proxy for accessing paginated resources
 */
export default class PaginatedResourceListing {
  /**
   * @param {Maps4News} api - Instance of the api
   * @param {String} route - Resource route
   * @param {ResourceBase} Target - Wrapper target
   * @param {Object|{}} query - Search query
   * @param {Number} page - Page number
   * @param {Number} perPage - Amount of items per page
   * @param {Number} pageCount - Resolved page count
   * @param {Number} rowCount - Resolved rowCount
   * @param {Array<ResourceBase>} data - Resolved data
   * @private
   */
  constructor(api, route, Target, query = {}, page = 1, perPage = api.defaults.perPage, pageCount = null, rowCount = 0, data = []) {
    if (!isParentOf(Maps4News, api)) {
      throw new TypeError('Expected api to be of type Maps4News');
    }

    this._api = api;
    this._route = route;
    this._Target = Target;
    this._query = query;

    this._data = data;
    this._page = page;
    this._perPage = perPage;
    this._rows = rowCount;
    this._pageCount = pageCount;
  }

  /**
   * Pagination header prefix
   * @returns {String} - Header prefix
   */
  static get headerPrefix() {
    return 'X-Paginate';
  }

  /**
   * Get api instance
   * @returns {Maps4News} - Api instance
   */
  get api() {
    return this._api;
  }

  /**
   * Target route
   * @returns {String} - url
   */
  get route() {
    return this._route;
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
   * Current page number
   * @returns {Number} - Current page
   */
  get page() {
    return this._page;
  }

  /**
   * Maximum amount of items per page
   * @returns {Number} - Amount of items
   */
  get perPage() {
    return this._perPage;
  }

  /**
   * Amount of pages available
   * @returns {Number} - Page count
   */
  get pageCount() {
    return this._pageCount;
  }

  /**
   * Page data
   * @returns {Array<ResourceBase>} - Wrapped data
   */
  get data() {
    return this._data;
  }

  /**
   * Row count
   * @returns {Number} - Row count
   */
  get rows() {
    return this._rows;
  }

  /**
   * Optional search query
   * @default {}
   * @return {Object<String, String|Array<String>>} - Query
   */
  get query() {
    return this._query;
  }

  /**
   * Optional search query
   * @param {Object<String, String|Array<String>>} value - Query
   * @throws TypeError
   * @default {}
   * @see {@link ResourceProxy#search}
   */
  set query(value) {
    // Verify query structure
    if (typeof value !== 'object') {
      throw new TypeError(`Expected value to be of type "Object" got "${getTypeName(value)}"`);
    }

    for (const key of Object.keys(value)) {
      if (typeof key !== 'string') {
        throw new TypeError(`Expected key to be of type "String" got "${getTypeName(key)}"`);
      }

      if (Array.isArray(value[key])) {
        if (value[key].length > 0) {
          for (const query of value[key]) {
            if (typeof query !== 'string') {
              throw new TypeError(`Expected query for "${key}" to be of type "String" got "${getTypeName(query)}"`);
            }
          }
        } else {
          // Drop empty nodes
          delete value[key];
        }
      } else if (typeof value[key] !== 'string') {
        throw new TypeError(`Expected query value to be of type "string" or "Array" got "${getTypeName(key)}"`);
      }
    }

    this._query = value;
  }

  /**
   * Get target page
   * @param {Number} page - Page number
   * @param {Number} perPage - Amount of items per page (max 50)
   * @returns {Promise} - Resolves with {@link PaginatedResourceListing} instance and rejects with {@link ApiError}
   */
  getPage(page, perPage = this.perPage) {
    page = Math.max(1, page);

    const query = {page};

    if (perPage) {
      perPage = Math.max(1, perPage);
      perPage = Math.min(50, perPage);

      query['per_page'] = perPage;
    }

    // Add search query (if any)
    if (Object.keys(this.query).length > 0) {
      query['search'] = this.query;
    }

    const url = `${this.route}?${encodeQueryString(query)}`;

    return new Promise((resolve, reject) => {
      this.api.request(url, 'GET', {}, {}, '', true)
        .then(request => {
          const response = JSON.parse(request.responseText);
          const rowCount = Number(request.getResponseHeader(`${PaginatedResourceListing.headerPrefix}-Total`));
          const totalPages = Number(request.getResponseHeader(`${PaginatedResourceListing.headerPrefix}-Pages`));

          const instance = new PaginatedResourceListing(
            this.api, this.route, this._Target, this.query,
            page, perPage, totalPages, rowCount,
            response.data.map(row => new this._Target(this.api, row)),
          );

          resolve(instance, request);
        }).catch(reject);
    });
  }

  /**
   * If there is a next page
   * @returns {boolean} - If there is a next page
   */
  get hasNext() {
    return this.page < this.pageCount;
  }

  /**
   * If there is a previous page
   * @returns {boolean} - If there is a previous page
   */
  get hasPrevious() {
    return this.page > 1;
  }

  /**
   * Used for caching pages internally
   * @returns {string} - Cache token
   * @see {@link PaginatedResourceWrapper}
   * @see {@link ResourceCache}
   */
  get cacheToken() {
    return encodeQueryString({query: this.query}).toLowerCase();
  }

  /**
   * Get next page
   * @returns {Promise} - Resolves with {@link PaginatedResourceListing} instance and rejects with {@link ApiError}
   */
  next() {
    return this.getPage(this.page + 1);
  }

  /**
   * Get previous page
   * @returns {Promise} - Resolves with {@link PaginatedResourceListing} instance and rejects with {@link ApiError}
   */
  previous() {
    return this.getPage(this.page - 1);
  }

  /**
   * Wraps {@link PaginatedResourceWrapper} around the page
   * @param {Boolean} cacheEnabled - If the pagination cache should be used
   * @param {Number} cacheTime - Amount of seconds to store a value in cache
   * @param {Boolean} shareCache - Share cache across instances
   * @returns {PaginatedResourceWrapper} - Wrapped resource listing
   */
  wrap(cacheEnabled = this.api.defaults.cacheEnabled, cacheTime = this.api.defaults.cacheSeconds, shareCache = this.api.defaults._shareCache) {
    return new PaginatedResourceWrapper(this, this.api, cacheEnabled, cacheTime, shareCache);
  }
}
