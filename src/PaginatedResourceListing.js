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

import Maps4News from './Maps4News';
import PaginatedResourceWrapper from './PaginatedResourceWrapper';
import RequestParameters from './RequestParameters';
import {isParentOf} from './utils/reflection';

/**
 * Proxy for accessing paginated resources
 */
export default class PaginatedResourceListing {
  /**
   * @param {Maps4News} api - Instance of the api
   * @param {String} route - Resource route
   * @param {ResourceBase} Target - Wrapper target
   * @param {RequestParameters} parameters - Request parameters
   * @param {Number} pageCount - Resolved page count
   * @param {Number} rowCount - Resolved rowCount
   * @param {Array<ResourceBase>} data - Resolved data
   * @private
   */
  constructor(api, route, Target, parameters, pageCount = null, rowCount = 0, data = []) {
    if (!isParentOf(Maps4News, api)) {
      throw new TypeError('Expected api to be of type Maps4News');
    }

    if (!isParentOf(RequestParameters, parameters)) {
      parameters = new RequestParameters(parameters);
    }

    this._api = api;

    this.route = route;
    this._Target = Target;
    this._parameters = parameters;
    this._pageCount = pageCount;
    this._rows = rowCount;
    this._data = data;
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
   * Override the target route
   * @param {String} value - route
   */
  set route(value) {
    if (!value.startsWith('https://') && !value.startsWith('http://')) {
      if (!value.startsWith('/')) {
        value = '/' + value;
      }

      value = `${this._api.host}/${this._api.version}${value}`;
    }

    this._route = value;
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
   * Request parameters
   * @returns {RequestParameters} - Request parameters
   */
  get parameters() {
    return this._parameters;
  }

  /**
   * Request parameters
   * @param {RequestParameters} value - Request parameters
   */
  set parameters(value) {
    this._parameters = value;
  }

  /**
   * Current page number
   * @returns {Number} - Current page
   */
  get page() {
    return this.parameters.page;
  }

  /**
   * Maximum amount of items per page
   * @returns {Number} - Amount of items
   */
  get perPage() {
    return this.parameters.perPage;
  }

  /**
   * Set sort direction
   * @returns {String} - Sort
   * @example
   * const sort = ['-name', 'id']
   */
  get sort() {
    return this.parameters.sort;
  }

  /**
   * Current sorting value
   * @param {String} value - Sort
   */
  set sort(value) {
    this.parameters.sort = value;
  }

  /**
   * Deleted items filter state
   * @returns {String} value - Deleted items filter state
   * @see {@link DeletedState}
   */
  get deleted() {
    return this.parameters.deleted;
  }

  /**
   * Deleted items filter state
   * @param {String} value - Deleted items filter state
   * @see {@link DeletedState}
   */
  set deleted(value) {
    this.parameters.deleted = value;
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
    return this.parameters.search;
  }

  /**
   * Optional search query
   * @param {Object<String, String|Array<String>>} value - Query
   * @throws {TypeError}
   * @default {}
   * @see {@link ResourceProxy#search}
   */
  set query(value) {
    this.parameters.search = value;
  }

  /**
   * Get target page
   * @param {Number} page - Page number
   * @param {Number} perPage - Amount of items per page (max 50)
   * @returns {Promise<PaginatedResourceListing>} - Target page
   * @throws {ApiError}
   */
  async getPage(page = this.page, perPage = this.perPage) {
    const query = this.parameters.copy();

    query.page = page;
    query.perPage = perPage;

    const glue = this.route.includes('?') ? '&' : '?';
    const url = this.route + glue + query.encode();

    const {data: {data}, headers} = await this.api.axios.get(url);

    const rowCount = Number(headers['X-Paginate-Total'] || data.length);
    const totalPages = Number(headers['X-Paginate-Pages'] || 1);
    const parameters = this.parameters.copy();

    parameters.page = page;

    return new PaginatedResourceListing(
      this.api, this.route, this._Target,
      parameters, totalPages, rowCount,
      data.map(row => new this._Target(this.api, row)),
    );
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
    return this.parameters.token();
  }

  /**
   * Get next page
   * @returns {Promise<PaginatedResourceListing>} - paginated resource {
   * @throws {ApiError}
   */
  next() {
    return this.getPage(this.page + 1);
  }

  /**
   * Get previous page
   * @returns {Promise<PaginatedResourceListing>} - paginated resource {
   * @throws {ApiError}
   */
  previous() {
    return this.getPage(this.page - 1);
  }

  /**
   * Wraps {@link PaginatedResourceWrapper} around the page
   * @param {Boolean} shareCache - Share cache across instances
   * @returns {PaginatedResourceWrapper} - Wrapped resource listing
   */
  wrap(shareCache = this.api.defaults._shareCache) {
    return new PaginatedResourceWrapper(this, this.api, shareCache);
  }
}
