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

import {downloadFile, fetch} from '../utils/requests';
import ResourceBase from './base/ResourceBase';

/**
 * Choropleth resource
 */
export default class Choropleth extends ResourceBase {
  static get resourceName() {
    return 'choropleths';
  }

  /**
   * Get the choropleth json
   * @returns {Promise<Object>} - choropleth json
   */
  getJson() {
    return fetch(this.url + '/json', {
      headers: this._getDownloadHeaders(),
    }).then(x => x.json());
  }

  /**
   * Get image blob url representation
   * @returns {Promise} - Resolves with a {@link String} containing a blob reference to the image and rejects with {@link ApiError}
   */
  downloadPreview() {
    return downloadFile(`${this.url}/preview`, this._getDownloadHeaders()).then(data => data.blob);
  }

  /**
   * Get headers for downloading resources
   * @returns {{Accept: string, Authorization: string}} - Request headers
   * @private
   */
  _getDownloadHeaders() {
    return {
      Accept: 'application/json',
      Authorization: this.api.auth.token.toString(),
      'X-No-CDN-Redirect': 'true',
    };
  }
}
