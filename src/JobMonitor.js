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

import { JobMonitorFilter } from './enums';
import Maps4News from './Maps4News';
import JobMonitorRow from './resources/JobMonitorRow';
import { isParentOf } from './utils/reflection';
import { encodeQueryString } from './utils/requests';

/**
 * Used for monitoring the job queue
 */
export default class JobMonitor {
  /**
   * JobMonitor constructor
   * @param {Maps4News} api - Api instance
   * @param {number} [maxRows=100] - Default maximum amount of rows
   * @param {boolean} [longPoll=true] - Use long-polling instead of regular poling
   */
  constructor (api, maxRows = Number(process.env.JOB_MONITOR_MAX_ROWS), longPoll = true) {
    if (!isParentOf(Maps4News, api)) {
      throw new TypeError('Expected api to be of type Maps4News');
    }

    this._api = api;

    this._maxAvailible = {};
    this._maxRows = Math.max(1, Number(maxRows));
    this._longPoll = Boolean(longPoll);
    this._lastUpdate = this._getTimestamp();
    this._data = [];
    this._filterStatus = JobMonitorFilter.DEFAULT;
    this._filterTags = [];
    this._purge = false;
    this._skipMaxUpdate = false;
    this._waiting = 0;
  }

  /**
   * Contains the current JobMonitor data
   * @returns {Array<JobMonitorRow>} - Job monitor rows
   */
  get data () {
    return this._data;
  }

  /**
   * Get api instance
   * @returns {Maps4News} - Api instance
   */
  get api () {
    return this._api;
  }

  /**
   * Update maxRows and run update()
   * @param {number} [count=50] - Amount to increase maxRows by
   * @returns {Promise<Number>} - number of updated rows
   * @throws {ApiError}
   */
  loadMore (count = 50) {
    this.maxRows += count;

    return this.update();
  }

  /**
   * Update the job list
   * @param {Boolean} [allowLongPoll=true] - If long polling is allowed
   * @returns {Promise<Number>} - number of updated rows
   * @throws {ApiError}
   * @todo refactor
   */
  update (allowLongPoll = true) {
    if (allowLongPoll && (this.waiting || this._lastUpdate === this._getTimestamp())) {
      return new Promise(resolve => {
        resolve(0); // Still waiting for the other promise to resolve or we're sure there is no new data
      });
    }

    // Counter so we don't have to worry about racing
    this._waiting += 1;

    if (this._purge) {
      this._data = [];
      this._purge = false;
    }

    // First we need to check if we have enough data to begin with
    let rowCountDiff = Math.min(this.maxRows, this.realMaxRows) - this.data.length;

    if (rowCountDiff < 0) {
      // Remove trailing data
      this._data.splice(this.maxRows, this.data.length - this.maxRows);
      rowCountDiff = 0;
    }

    let requestedRowCount = 0;
    const requests = [];

    const skipLongPoll = rowCountDiff > 0;

    if (!skipLongPoll && !allowLongPoll) {
      return new Promise(resolve => resolve(0));
    }

    while (rowCountDiff > 0) {
      // @todo Either always do 50 or calculate the correct page number and stuff which takes time...
      const perPage = 50;
      // Math.min(rowCountDiff, 50);

      const page = Math.floor((this.data.length + requestedRowCount) / perPage) + 1;

      this.api.logger.debug([
        `[JobMonitor] have ${this.data.length + requestedRowCount}`,
        `Diff: ${rowCountDiff}`,
        `PerPage: ${perPage}`,
        `Page: ${page}`,
        `Target: ${perPage * page}`,
      ].join(', '));

      const params = {
        'per_page': perPage,
        page,
      };

      if (this.filterTags.length > 0) {
        params.tags = this.filterTags;
      }

      const url = `${this._baseUrl}&${encodeQueryString(params)}`;

      const request = this.api.axios.get(url)
        .then(response => response.data.data.map(x => new JobMonitorRow(this.api, x)));

      requests.push(request);

      requestedRowCount += perPage;
      rowCountDiff -= perPage;
      this._waiting++;
    }

    const out = [];

    // note: Promise.all resolves with the data in the same order as the input
    out.push(Promise.all(requests).then(data => {
      // Join data
      data = data.reduce((acc, val) => acc.concat(val), []);

      // Append data
      this._data = this.data.concat(data);

      const oldLength = this.data.length;

      // Remove duplicates
      this._data = this.data.filter((thing, index, self) => index === self.findIndex(t => t.id === thing.id));

      // We're no longer waiting
      this._waiting -= requests.length;

      return data.length - (oldLength - this.data.length);
    }));

    // Fetch updates
    let url = `${this._baseUrl}&timestamp=${Math.floor(this._lastUpdate)}`;

    if (this.longPoll && !skipLongPoll) {
      url += '&long_poll';
    }

    this._lastUpdate = this._getTimestamp();

    const promise = this.api.axios
      .get(url)
      .then(response => response.data.data)
      .then(data => data.map(x => new JobMonitorRow(this.api, x)))
      .then(data => {
        const lookup = data.map(x => x.id);
        let updateCount = 0;

        for (let i = 0; i < this._data.length && lookup.length > 0; i++) {
          const ii = lookup.indexOf(this._data[i].id);

          if (ii !== -1) {
            this._data[i] = data[ii];

            // Remove the data and the lookup entry
            data.splice(ii, 1);
            lookup.splice(ii, 1);
            updateCount++;
          }
        }

        // Prepend new data
        this._data = data.concat(this._data);

        this._waiting--;

        return updateCount;
      });

    out.push(promise);

    return Promise
      .all(out)
      .then(x => x.reduce((s, v) => s + v, 0))
      .then(rowCount => {
        const droppedRowCount = this.data.length - this.maxRows;

        // Truncate data if needed
        this._data.splice(this.maxRows, this.data.length - this.maxRows);

        if (!this._skipMaxUpdate) {
          this._maxAvailible[this._baseUrl] = this.data.length;
        }

        this.api.logger.debug(`Target: ${this.maxRows}, Actual: ${this.data.length}, Updated: ${rowCount}, Dropped: ${droppedRowCount}, RealMax: ${this.realMaxRows}`);

        this._skipMaxUpdate = false;

        return rowCount;
      }).catch(e => {
        this._waiting = 0;
        throw e;
      });
  }

  /**
   * If the JobMonitor is waiting for data. Any update request will
   * resolve with false instantly while this is true.
   * @returns {Boolean} - Waiting for data
   */
  get waiting () {
    return this._waiting > 0;
  }

  /**
   * Maximum number of rows to store
   * @returns {number} - Maximum number of rows
   */
  get maxRows () {
    return this._maxRows || Number(process.env.JOB_MONITOR_MAX_ROWS) || 100;
  }

  /**
   * Set the maximum number of rows to store. Updating this value won't take
   * effect until the {@link JobMonitor#update} method has been called.
   * @param {number} value - Maximum number of rows
   */
  set maxRows (value) {
    value = Number(value);
    value = Math.max(1, value);

    this.api.logger.debug(`Setting maxRows to ${value}. skipping maxUpdate next cycle.`);

    this._skipMaxUpdate = true;
    this._maxAvailible[this._baseUrl] = value;
    this._maxRows = value;
  }

  /**
   * Used to get internal reference max rows
   */
  get realMaxRows () {
    return this._maxAvailible[this._baseUrl] || this.maxRows;
  }

  get _baseUrl () {
    return `/jobs/monitor/${this.filterStatus}?internal=${!this.hideInternal}`;
  }

  /**
   * If internal users should be hidden. Updating this value won't take
   * effect until the {@link JobMonitor#update} method has been called.
   * @param {boolean} [value=false] - hide internal users
   */
  set hideInternal (value) {
    value = Boolean(value);

    if (this._hideInternal !== value) {
      this._purge = true;
    }

    this._hideInternal = value;
  }

  /**
   * If internal users should be hidden in the data
   * @returns {boolean} - hide internal users
   */
  get hideInternal () {
    return this._hideInternal || false;
  }

  /**
   * Set the filter for the job monitor
   * @param {string} value - Job monitor filter
   * @see {@link JobMonitorFilter}
   */
  set filterStatus (value) {
    value = value.toLowerCase();

    if (!JobMonitorFilter.values().includes(value)) {
      throw new TypeError(`Expected value to be property of JobMonitorFilter. Possible options: ${JobMonitorFilter.values().join(', ')}`);
    }

    if (this._filterStatus !== value) {
      this._purge = true;
    }

    this._filterStatus = value;
  }

  /**
   * get the filter for the job monitor
   * @returns {string} - Job monitor filter
   */
  get filterStatus () {
    return this._filterStatus;
  }

  set filterTags (value) {
    if (Array.isArray('array')) {
      let valueType = value.toString();

      if (valueType !== null && typeof value !== 'undefined') {
        valueType = value.constructor.name;
      }

      throw new TypeError(`Expected value to be of type array got ${valueType}.`);
    }

    this._filterTags = value;
  }

  get filterTags () {
    return this._filterTags;
  }

  /**
   * Returns the time the ::update method was called for the last time.
   * @returns {Date} - Last update
   * @throws {JobMonitor#update}
   */
  get lastUpdate () {
    return new Date(this._lastUpdate * 1000);
  }

  /**
   * Get if long polling should be used
   * @returns {boolean} - If long polling should be used
   */
  get longPoll () {
    return this._longPoll;
  }

  /**
   * Set if long polling should be used
   * @param {boolean} value - If long polling should be used
   */
  set longPoll (value) {
    this._longPoll = Boolean(value);
  }

  _getTimestamp () {
    return Date.now() / 1000;
  }
}
