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

import CrudBase from './base/CrudBase';

/**
 * Contract resource
 */
export default class Contract extends CrudBase {
  get resourceName() {
    return 'contracts';
  }

  /**
   * @inheritDoc
   * @override
   */
  _update() {
    this._updateProperties();

    // We'll just fake it, no need to bother the server
    // with an empty request.
    if (Object.keys(this._properties).length === 0) {
      return new Promise(() => this);
    }

    const data = Object.assign({}, this._properties);

    if (typeof data.dateStart === 'undefined') {
      data.dateStart = this.dateStart;
    }

    if (typeof data.dateEnd === 'undefined') {
      data.dateEnd = this.dateEnd;
    }

    if (typeof data.dateStart instanceof Date) {
      data.dateStart = this._formatDate(data.dateStart);
    }

    if (typeof data.dateEnd instanceof Date) {
      data.dateEnd = this._formatDate(data.dateEnd);
    }

    return this.api
      .request(this.url, 'PATCH', data)
      .then(() => {
        if (this.api.defaults.autoUpdateSharedCache) {
          this.api.cache.update(this);
        }

        return this;
      });
  }

  /**
   * @inheritDoc
   * @override
   */
  _create() {
    const createData = this._buildCreateData();

    if (createData['date_start'] instanceof Date) {
      createData['date_start'] = this._formatDate(createData['date_start']);
    }

    if (createData['date_end'] instanceof Date) {
      createData['date_end'] = this._formatDate(createData['date_end']);
    }

    return this.api
      .request(this.baseUrl, 'POST', createData)
      .then(data => {
        this._properties = {};
        this._baseProperties = data;

        this._updateProperties();
        return this;
      });
  }

  /**
   * Convert Date into server format
   * @param {Date} date - target
   * @returns {String} - formatted date
   * @private
   */
  _formatDate(date) {
    const pad = num => ('00' + num).slice(-Math.max(String(num).length, 2));

    let out = [
      date.getUTCFullYear(),
      date.getUTCMonth() + 1,
      date.getUTCDate(),
    ].map(pad).join('-');

    out += ' ' + [
      date.getUTCHours(),
      date.getUTCMinutes(),
      date.getUTCSeconds(),
    ].map(pad).join(':');

    return out;
  }
}
