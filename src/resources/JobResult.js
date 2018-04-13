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

import {downloadFile} from '../utils/requests';
import ResourceBase from './base/ResourceBase';

export default class JobResult extends ResourceBase {
  get resourcePath() {
    return '/jobs/{job_id}/revisions/{revision}/result';
  }

  get resourceName() {
    return 'job-result';
  }

  /**
   * Get the related job
   * @returns {Promise<Job, ApiError>} - The job related to this row
   */
  get job() {
    return this.api.jobs.get(this.jobId);
  }

  /**
   * Get the related job revision
   * @returns {Promise<JobRevision, ApiError>} - The job revision related to this row
   */
  get jobRevision() {
    return this.api.jobs.select(this.jobId).revisions.get(this.id);
  }

  /**
   * Job result archive url
   * @returns {string} - Archive url
   */
  get outputUrl() {
    return this.url.replace('/result', '/output');
  }

  /**
   * Get archive blob url
   * @returns {PromiseLike<{filename: string, blob: string}>} - Resolves with a blob reference and it's filename and rejects with {@link ApiError}
   */
  downloadOutput() {
    return downloadFile(this.outputUrl, this._getDownloadHeaders());
  }

  /**
   * Get the output url url
   * @returns {string} - Output url url
   */
  get outputUrlUrl() {
    return `${this.outputUrl}-url`;
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
    return this.url.replace('/result', '/log');
  }

  /**
   * Get log blob url
   * @returns {Promise} - Resolves with a {@link String} containing a blob reference to the archive and rejects with {@link ApiError}
   */
  downloadLog() {
    return downloadFile(this.logUrl, this._getDownloadHeaders()).then(data => data.blob);
  }

  /**
   * Job result preview url, usable in an `<img>` tag
   * @returns {string} - Preview url
   */
  get previewUrl() {
    return this.url.replace('/result', '/preview');
  }

  /**
   * Get image blob url representation
   * @returns {Promise} - Resolves with a {@link String} containing a blob reference to the image and rejects with {@link ApiError}
   */
  downloadPreview() {
    return downloadFile(this.previewUrl, this._getDownloadHeaders()).then(data => data.blob);
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
    };
  }
}
