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

import {snake as snakeCase} from 'case';
import {EventEmitter} from 'events';
import Maps4News from './Maps4News';
import RequestParameters from './RequestParameters';
import ResourceBase from './resources/base/ResourceBase';
import {isParentOf} from './utils/reflection';

/**
 * Paginated resource lister
 *
 * @fires ResourceLister#update
 */
export default class ResourceLister extends EventEmitter {
  /**
   * ResourceLister constructor
   *
   * @param {Maps4News} api - Api instance
   * @param {string} route - Resource url route
   * @param {Constructor<ResourceBase>} Resource - Resource constructor
   * @param {?RequestParameters} parameters - Request parameters
   * @param {number} [maxRows=50] - Initial max rows
   * @param {string} [key=id] - Key
   */
  constructor(api, route, Resource = ResourceBase, parameters = null, maxRows = 50, key = 'id') {
    super();

    if (!isParentOf(Maps4News, api)) {
      throw new TypeError('Expected api to be of type Maps4News');
    }

    this._api = api;
    this._Resource = Resource;
    this._route = route || (new this.Resource(api, {})).baseUrl;
    this._parameters = new RequestParameters(parameters || {perPage: RequestParameters.maxPerPage});
    this._key = snakeCase(key);
    this._waiting = false;

    this.autoUpdate = true;
    this.maxRows = maxRows;

    this._reset();
  }

  /**
   * Get if there are more resources to fetch. It indicates if the maxRows can be increased.
   * @returns {boolean} - if more rows are available
   */
  get hasMore() {
    return typeof this.availableRows === 'undefined' || this.availableRows > this.maxRows;
  }

  /**
   * Get if the instance is waiting for data
   * @returns {boolean} - waiting for data
   */
  get waiting() {
    return this._waiting;
  }

  /**
   * Get the request parameters
   * @returns {RequestParameters} - parameters
   */
  get parameters() {
    return this._parameters;
  }

  /**
   * Set the request parameters
   *
   * If you set {@link ResourceLister#autoUpdate} to true then {@link ResourceLister#update}
   * will automatically be called when the parameters are updated.
   * @see ResourceLister#autoUpdate
   * @param {RequestParameters} object - parameters
   */
  set parameters(object) {
    this.parameters.apply(object);
  }

  /**
   * Resource constructor accessor, used for building the resource instance
   * @returns {Constructor<ResourceBase>} - resource constructor
   */
  get Resource() {
    return this._Resource;
  }

  /**
   * Get the route (url)
   * @returns {string} - route
   */
  get route() {
    return this._route;
  }

  /**
   * Get the data
   * @returns {Array<ResourceLister.Resource>} - data
   */
  get data() {
    return this._data;
  }

  /**
   * Get the api instance
   * @returns {Maps4News} - api instance
   */
  get api() {
    return this._api;
  }

  /**
   * Get the row count
   *
   * @see {ResourceLister.data}
   * @returns {number} - row count
   */
  get rowCount() {
    return this.data.length;
  }

  /**
   * Get the maximum amount of rows allowed
   * @returns {number} - max rows
   */
  get maxRows() {
    return this._maxRows;
  }

  /**
   * Set the maximum amount of rows allowed
   * @param {number} value - max rows
   */
  set maxRows(value) {
    value = Number(value);

    if (Number.isNaN(value)) {
      throw new TypeError(`Expected maxRows to be numeric got ${typeof raw}`);
    }

    this._maxRows = value;

    if (this.autoUpdate) {
      // noinspection JSIgnoredPromiseFromCall
      this.update();
    }
  }

  /**
   * Get the number of rows the server has available
   * @returns {number} - number of rows
   */
  get availableRows() {
    return this._availableRows;
  }

  /**
   * Set if {@link ResourceLister#update} should be called when {@link ResourceLister#parameters} is updated
   *
   * @see ResourceLister#update
   * @see ResourceLister#parameters
   * @param {boolean} value - auto update
   */
  set autoUpdate(value) {
    value = Boolean(value);

    if (this.autoUpdate !== value) {
      this._autoUpdate = value;

      if (typeof this._boundUpdate === 'undefined') {
        this._boundUpdate = this.update.bind(this);
      }

      if (this.autoUpdate) {
        this.parameters.on('change', this._boundUpdate);
      } else {
        this.parameters.off('change', this._boundUpdate);
      }
    }
  }

  /**
   * Get if {@link ResourceLister#update} should be called when {@link ResourceLister#parameters} is updated
   *
   * @see ResourceLister#update
   * @see ResourceLister#parameters
   */
  get autoUpdate() {
    return this._autoUpdate;
  }

  /**
   * Reset the instance
   *
   * @returns {void}
   * @private
   */
  _reset() {
    this._parameterToken = this.parameters.token();

    this._realData = [];
    this._data = [];
    this._keys = [];

    delete this._availableRows;
  }

  /**
   * Update the server data
   *
   * @returns {Promise<void>} - Resolves when the data has been updated
   * @async
   */
  async update() {
    if (this.waiting) {
      return;
    }

    this._waiting = true;

    try {
      if (this._parameterToken !== this.parameters.token()) {
        this._reset();
      }

      if (this._realData.length < this.maxRows) {
        await this._fetchMore();
      }

      if (this.data.length !== this.maxRows) {
        this._data = this._realData.slice(0, this.maxRows);
      }
    } finally {
      this._waiting = false;
    }

    /**
     * Update event.
     * Called when the ResourceLister has updated
     *
     * @event RequestLister#update
     */
    this.emit('update');
  }

  /**
   * Fetch more data from the server
   * @returns {Promise<void>} - Resolves when _availableRows has been updated
   * @private
   */
  async _fetchMore() {
    const startPage = 1 + Math.floor(this.rowCount / this.parameters.perPage);
    const endPage = Math.ceil(this.maxRows / this.parameters.perPage);
    const glue = this.route.includes('?') ? '&' : '?';

    const promises = [];

    for (let page = startPage; page <= endPage; page++) {
      const parameters = this.parameters.copy();

      parameters.page = page;

      const url = this.route + glue + parameters.encode();

      const promise = this.api.request(url, 'GET', {}, {}, true);

      promises.push(promise);
    }

    // Wait for responses and flatten data
    const responses = await Promise.all(promises);
    const data = [].concat(...responses.map(x => x.data));

    this._availableRows = Number(responses[0].response.headers.get('X-Paginate-Total')) || 0;

    data.forEach(row => this.push(row, false));
  }

  /**
   * Returns the iterable
   * @returns {Iterator} - iterator
   */
  [Symbol.iterator]() {
    return this.data[Symbol.iterator]();
  }

  /**
   * Push a row to the data collection
   *
   * This will append the row or update an existing row based on the key. If autoMaxRows is set to true and maxRows only needs to be increased by one for the new resource to show up it will
   * @param {ResourceLister.Resource} row - resource
   * @param {boolean} autoMaxRows - Increase maxRows if needed
   * @returns {void}
   */
  push(row, autoMaxRows = true) {
    if (!isParentOf(this.Resource, row)) {
      row = new this.Resource(this.api, row);
    }

    const index = this._keys.findIndex(i => i === row[this._key]);

    if (index >= 0) {
      this._realData[index] = row;

      if (typeof this._data[index] !== 'undefined') {
        this._data[index] = row;
      }
    } else {
      this._realData.push(row);

      this._keys.push(row[this._key]);

      if (autoMaxRows) {
        this.maxRows++;

        this._data.push(row);
      }
    }
  }

  /**
   * Same as `this.maxRows += this.parameters.perPage`
   * @param {number} [rows=parameters.perPage] - Amount to increment maxRows with
   * @returns {void}
   */
  loadMore(rows = this.parameters.perPage) {
    this.maxRows += rows;
  }
}
