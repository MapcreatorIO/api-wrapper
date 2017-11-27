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

import {JobMonitorFilter} from './enums';
import JobMonitorRow from './JobMonitorRow';
import Maps4News from './Maps4News';
import {isParentOf} from './utils/reflection';

/**
 * Used for monitoring the job queue
 * @todo store data/timestamp based on status to make status filter switching smoother
 */
export default class JobMonitor {
  /**
   * JobMonitor constructor
   * @param {Maps4News} api - Api instance
   */
  constructor(api) {
    if (!isParentOf(Maps4News, api)) {
      throw new TypeError('Expected api to be of type Maps4News');
    }

    this._api = api;

    this._lastUpdate = Date.now();
    this._data = [];
    this._filterStatus = JobMonitorFilter.DEFAULT;
    this._purge = false;
  }

  /**
   * Contains the current JobMonitor data
   * @returns {Array<JobMonitorRow>} - Job monitor rows
   */
  get data() {
    return this._data;
  }

  /**
   * Get api instance
   * @returns {Maps4News} - Api instance
   */
  get api() {
    return this._api;
  }

  /**
   * Update the job list
   * @returns {Promise<Number, ApiError>} - Resolves with the number of updated rows
   */
  update() {
    if (this.waiting) {
      return new Promise((resolve, reject) => {
        reject(0); // Still waiting for the other promise to resolve
      });
    }

    // Counter so we don't have to worry about racing
    this._waiting = 1;

    if (this._purge) {
      this._data = [];
    }

    // First we need to check if we have enough data to begin with
    let rowCountDiff = this.maxRows - this.data.length;

    if (rowCountDiff < 0) {
      // Remove trailing data
      this._data.splice(this.maxRows, this.data.length - this.maxRows);
      rowCountDiff = 0;
    }

    const baseUrl = `/jobs/monitor/${this.filterStatus}?internal=${!this.hideInternal}`;
    let requestedRowCount = 0;
    const requests = [];

    while (rowCountDiff > 0) {
      // Either always do 50 or calculate the correct page number and stuff which takes time...
      const perPage = 50; // Math.min(rowCountDiff, 50);
      const page = Math.floor((this.data.length + requestedRowCount) / perPage) + 1;

      // Usefull for debugging:
      // console.log('have', this.data.length + requestedRowCount, 'diff', rowCountDiff, 'perPage', perPage, 'page', page, 'target', perPage * page);

      const url = `${baseUrl}&per_page=${perPage}&page=${page}`;

      requests.push(this.api.request(url).then(data => data.map(x => new JobMonitorRow(this.api, x))));

      requestedRowCount += perPage;
      rowCountDiff -= perPage;
      this._waiting++;
    }

    const out = [];

    // note: Promise.all resolves with the data in the same order as the input
    out.push(Promise.all(requests).then(data => {
      // Join data
      data = data.reduce((acc, val) => acc.concat(val), []);

      // append data and remove duplicates
      // noinspection JSCheckFunctionSignatures
      this._data = this.data
        .concat(data)
        .filter((thing, index, self) =>
          index === self.findIndex((t) => t.id === thing.id),
        );

      // We're no longer waiting
      this._waiting -= requests.length;

      return data.length;
    }));

    // Fetch updates
    const url = baseUrl + '&timestamp=' + Math.floor(this._lastUpdate / 1000);

    this._lastUpdate = Date.now();

    out.push(this.api
      .request(url)
      .then(data => data.map(x => new JobMonitorRow(this.api, x)))
      .then(data => {
        const lookup = data.map(x => x.id);

        for (let i = 0; i < this._data.length && lookup.length > 0; i++) {
          const ii = lookup.indexOf(this._data[i].id);

          if (ii !== -1) {
            this._data[i] = data[ii];

            // Remove the data and the lookup entry
            data.splice(ii, 1);
            lookup.splice(ii, 1);
          }
        }

        // Prepend new data
        this._data = data.concat(this._data);

        this._waiting--;
      }));

    return Promise
      .all(out)
      .then(x => {
        // Truncate data if needed
        this._data.splice(this.maxRows, this.data.length - this.maxRows);

        return x;
      })
      .then(x => x.reduce((s, v) => s + v, 0));
  }

  /**
   * If the JobMonitor is waiting for data. Any update request will
   * resolve with false instantly while this is true.
   * @returns {Boolean} - Waiting for data
   */
  get waiting() {
    return this._waiting;
  }

  /**
   * Maximum number of rows to store
   * @returns {number} - Maximum number of rows
   */
  get maxRows() {
    return this._maxRows || Number(process.env.JOB_MONITOR_MAX_ROWS) || 100;
  }

  /**
   * Set the maximum number of rows to store. Updating this value won't take
   * effect until the {@link JobMonitor#update} method has been called.
   * @param {number} value - Maximum number of rows
   */
  set maxRows(value) {
    value = Number(value);
    value = Math.max(1, value);

    this._maxRows = value;
  }

  /**
   * If internal users should be hidden. Updating this value won't take
   * effect until the {@link JobMonitor#update} method has been called.
   * @param {boolean} [value=false] - hide internal users
   */
  set hideInternal(value) {
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
  get hideInternal() {
    return this._hideInternal;
  }

  /**
   * Set the filter for the job monitor
   * @param {string} value - Job monitor filter
   * @see JobMonitorFilter
   */
  set filterStatus(value) {
    value = value.toLowerCase();

    if (!JobMonitorFilter.values().includes(value)) {
      throw new TypeError('Expected value to be property of JobMonitorFilter. Possible options: ' + JobMonitorFilter.values().join(', '));
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
  get filterStatus() {
    return this._filterStatus;
  }

  /**
   * Returns the time the ::update method was called for the last time.
   * @returns {Date} - Last update
   * @see JobMonitor#update
   */
  get lastUpdate() {
    return new Date(this._lastUpdate);
  }
}
