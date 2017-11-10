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

import ApiError from '../errors/ApiError';
import {fetch} from '../utils/requests';
import ResourceBase from './base/ResourceBase';

export default class JobResult extends ResourceBase {
  get resourcePath() {
    return '/jobs/{job_id}/revisions/{revision}/result';
  }

  get resourceName() {
    return 'job-result';
  }

  /**
   * Job result archive url
   * @returns {string} - Archive url
   */
  get outputUrl() {
    return `${this.url}/output`;
  }

  /**
   * Get archive blob url
   * @returns {Promise} - Resolves with a {@link String} containing a blob reference to the archive and rejects with {@link ApiError}
   */
  downloadOutput() {
    return this._download(this.outputUrl);
  }

  /**
   * Get archive blob url
   * @returns {Promise} - Resolves with a {@link String} containing a blob reference to the archive and rejects with {@link ApiError}
   * @deprecated
   */
  downloadArchive() {
    return this.downloadOutput();
  }

  /**
   * Get the output url url
   * @returns {string} - Output url url
   */
  get outputUrlUrl() {
    return `${this.url}/output-url`;
  }

  /**
   * Get the remote output url
   * @returns {Promise} -  Resolves with a {@link String} containing the url to the output and rejects with {@link ApiError}
   */
  getOutputUrl() {
    return this.api.request(this.outputUrlUrl).then(x => x.url);
  }

  /**
   * Job result log url
   * @returns {string} - log url
   */
  get logUrl() {
    return `${this.url}/log`;
  }

  /**
   * Get log blob url
   * @returns {Promise} - Resolves with a {@link String} containing a blob reference to the archive and rejects with {@link ApiError}
   */
  downloadLog() {
    return this._download(this.logUrl);
  }

  /**
   * Job result preview url, usable in an `<img>` tag
   * @returns {string} - Preview url
   */
  get previewUrl() {
    return `${this.url}/preview`;
  }

  /**
   * Get image blob url representation
   * @returns {Promise} - Resolves with a {@link String} containing a blob reference to the image and rejects with {@link ApiError}
   */
  downloadPreview() {
    return this._download(this.previewUrl);
  }

  _download(url) {
    const headers = {
      Accept: 'application/json',
      Authorization: this.api.auth.token.toString(),
    };

    return fetch(url, {headers})
      .then(res => {
        if (res.ok) {
          return res.blob();
        }
        return res.json().then(data => {
          const err = data.error;

          throw new ApiError(err.type, err.message, res.status);
        });

      })
      .then(blob => (window.URL || window.webkitURL).createObjectURL(blob));
  }
}
