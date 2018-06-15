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
import RequestParameters from './RequestParameters';
import {isParentOf} from './utils/reflection';

export default class ResourceLister {
  /**
   *
   * @param {Maps4News} api - Api instance
   * @param {string} route - Resource url route
   * @param {ResourceBase} Resource - Resource constructor
   * @param {?RequestParameters} parameters - Request parameters
   * @param {number} [maxRows=50] - Initial max rows
   * @param {string} [key=id] - Key
   */
  constructor(api, route, Resource, parameters = null, maxRows = 50, key = 'id') {
    if (!isParentOf(Maps4News, api)) {
      throw new TypeError('Expected api to be of type Maps4News');
    }

    this._api = api;

    this._maxRows = maxRows;
    this._data = [];
    this._realData = [];
    this._keys = [];
    this._key = key;
    this._Resource = Resource;
    this._availibleRows = 0;

    this.parameters = parameters || new RequestParameters({perPage: RequestParameters.maxPerPage});

    this._route = route || (new Resource(api, {})).baseUrl;
  }

  get parameters() {
    return this._parameters;
  }

  set parameters(object) {
    if (object instanceof RequestParameters) {
      this._parameters = object;
    } else {
      this._parameters = new RequestParameters(object);
    }
  }

  get Resource() {
    return this._Resource;
  }

  get route() {
    return this._route;
  }

  get data() {
    return this._data;
  }

  get api() {
    return this._api;
  }

  get rowCount() {
    return this.data.length;
  }

  get maxRows() {
    return this._maxRows;
  }

  set maxRows(raw) {
    const value = Number(raw);

    if (Number.isNaN(value)) {
      throw new TypeError(`Expected maxRows to be numeric got ${typeof raw}`);
    }

    this._maxRows = value;
  }

  get availibleRows() {
    return this._availibleRows;
  }

  async update() {
    if (this._realData.length < this.maxRows) {
      await this._fetchMore();
    }

    this._data = this._realData.slice(0, this.maxRows);

    this.maxRows = this.rowCount;
  }

  async _fetchMore() {
    const startPage = 1 + Math.floor(this.rowCount / RequestParameters.maxPerPage);
    const endPage = Math.ceil(this.maxRows / RequestParameters.maxPerPage);
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
    // @todo handle 404 and guess max page count
    const responses = await Promise.all(promises);
    const data = [].concat(...responses.map(x => x.data));

    this._availibleRows = Number(responses[0].response.headers.get('X-Paginate-Total')) || 0;

    data.forEach(row => this.push(row));
  }

  [Symbol.iterator]() {
    return this.data[Symbol.iterator]();
  }

  push(row) {
    if (!isParentOf(this.Resource, row)) {
      row = new this.Resource(this.api, row);
    }

    const index = this._keys.findIndex(i => i === row[this._key]);

    if (index >= 0) {
      this._realData[index] = row;
    } else {
      this._realData.push(row);

      this._keys.push(row[this._key]);
    }
  }
}
