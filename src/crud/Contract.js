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

    data.dateStart = this._formatDate(data.dateStart);
    data.dateEnd = this._formatDate(data.dateEnd);

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
   */
  _create() {
    const createData = this._buildCreateData();

    if (typeof createData.dateStart !== 'undefined') {
      createData.dateStart = this._formatDate(createData.dateStart);
    }

    if (typeof createData.dateEnd !== 'undefined') {
      createData.dateEnd = this._formatDate(createData.dateEnd);
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
   * Convert Date into server format, will return original value if date is not of type Date.
   * @param {Date} date - target
   * @returns {*} - formatted date or original value
   * @private
   */
  _formatDate(date) {
    if (!(date instanceof Date)) {
      return date;
    }

    function pad(num, size = 2) {
      let s = num.toString();

      while (s.length < size) {
        s = '0' + s;
      }

      return s;
    }

    let out = [
      date.getUTCFullYear(),
      date.getUTCMonth(),
      date.getUTCDay(),
    ].map(pad).join('-');

    out += ' ' + [
      date.getUTCHours(),
      date.getUTCMinutes(),
      date.getUTCSeconds(),
    ].map(pad).join(':');

    return out;
  }

  _zeroPad(num, size) {
    var s = num + '';
    while (s.length < size) s = '0' + s;
    return s;
  }
}
