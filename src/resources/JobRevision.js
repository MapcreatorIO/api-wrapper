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

import {isParentOf} from '../utils/reflection';
import CrudBase from './base/CrudBase';
import JobResult from './JobResult';
import JobShare from './JobShare';
import Layer from './Layer';

export default class JobRevision extends CrudBase {
  get baseUrl() {
    return `/jobs/${this.jobId}/revisions`;
  }

  get resourcePath() {
    return '/jobs/{job_id}/revisions/{revision}';
  }

  get resourceName() {
    return 'job-revisions';
  }

  static get resourceUrlKey() {
    return 'revision';
  }

  /**
   * Get layers
   * @returns {SimpleResourceProxy} - A proxy for accessing the resource
   */
  get layers() {
    return this._proxyResourceList(Layer);
  }

  /**
   * Get the job result
   * @returns {Promise} - Resolves with a {@link JobResult} instance and rejects with {@link ApiError}
   */
  result() {
    const url = `${this.url}/result`;

    return this.api
      .request(url)
      .then(data => {
        data.jobId = this.jobId;
        data.revision = this.revision;

        return new JobResult(this.api, data);
      });
  }

  /**
   * Get a result proxy
   *
   * @returns {JobResult} - Empty job result used for
   */
  get resultProxy() {
    const data = {
      jobId: this.jobId,
      revision: this.revision,
    };

    return new JobResult(this.api, data);
  }

  // noinspection JSCheckFunctionSignatures
  /**
   * Save updated job revision
   * @param {Object} object - Map object
   * @param {Array<Layer>|Array<Number>|null} layers - Array containing all layers for this revision. If set to null the same layers will be used
   * @returns {Promise} - Resolves with a new {@link JobRevision} instance and rejects with {@link ApiError}
   * @throws TypeError
   */
  save(object = {}, layers = null) {
    if (layers && layers.length > 0) {
      if (isParentOf(Layer, layers[0])) {
        layers = layers.map(layer => layer.id);
      } else if (typeof layers[0] !== 'number') {
        throw new TypeError('layers property is not of type Array<Layer>, Array<Number> or null');
      }
    }

    const data = {
      'object': JSON.stringify(object),
      'language_code': this.languageCode,
      'mapstyle_set_id': this.mapstyleSetId,
    };

    if (layers) {
      data.layers = layers;
    }

    return this.api
      .request(this.baseUrl, 'POST', data)
      .then(data => new JobRevision(this.api, data));
  }

  /**
   * Get job object
   * @returns {Promise} - Resolves with {@link Object} instance containing the map object and rejects with {@link ApiError}
   * @todo document object format
   */
  object() {
    const url = `${this.url}/object`;

    return this.api.request(url);
  }

  /**
   * Build the revision
   * @param {String} callbackUrl - Optional callback url for when the job completes
   * @returns {Promise} - Resolves with an empty {@link Object} and rejects with {@link ApiError}
   */
  build(callbackUrl) {
    const url = `${this.url}/build`;
    const data = {callback: callbackUrl};

    return this.api.request(url, 'POST', data);
  }

  /**
   * Cancels a running job
   * @returns {Promise} - Resolves with an empty {@link Object} and rejects with {@link ApiError}
   */
  cancel() {
    const url = `${this.url}/cancel`;

    return this.api.request(url, 'POST');
  }

  /**
   * Share the job revision
   * @param {String} visibility - See {@link JobShareVisibility}, either `private` or `organisation`
   * @returns {Promise} - Resolves with a {@link String} containing the share link and rejects with {@link ApiError}
   */
  share(visibility = JobShare.visibility.PRIVATE) {
    visibility = visibility.toLowerCase();

    if (visibility !== JobShare.visibility.ORGANISATION &&
      visibility !== JobShare.visibility.PRIVATE) {
      throw new Error(`Unknown visibility '${visibility}'`);
    }

    const url = `${this.url}/share`;

    return this.api.request(url, 'POST', {visibility});
  }

  /**
   * Clones a job revision to the user requesting it
   * @returns {Promise} - Resolves with an empty {@link Object} and rejects with {@link ApiError}
   */
  clone() {
    const url = `${this.url}/clone`;

    return this.api.request(url, 'POST');
  }
}
