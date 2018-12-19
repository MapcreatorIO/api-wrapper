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

import { isParentOf } from '../utils/reflection';
import CrudBase from './base/CrudBase';
import JobResult from './JobResult';
import JobShare from './JobShare';
import Layer from './Layer';

export default class JobRevision extends CrudBase {
  get baseUrl () {
    return `/jobs/${this.jobId}/revisions`;
  }

  static get resourcePath () {
    return '/jobs/{job_id}/revisions/{revision}';
  }

  static get resourceName () {
    return 'job-revisions';
  }

  static get resourceUrlKey () {
    return 'revision';
  }

  /**
   * Get layers
   * @returns {SimpleResourceProxy} - A proxy for accessing the resource
   */
  get layers () {
    return this._proxyResourceList(Layer);
  }

  /**
   * Get the job result
   * @returns {Promise<JobResult>} - The associated job result
   * @throws {ApiError}
   */
  async result () {
    const { data: { data } } = await this.api.axios.get(`${this.url}/result`);

    data.jobId = this.jobId;
    data.revision = this.revision;

    return new JobResult(this.api, data);
  }

  /**
   * Get a result proxy
   *
   * @returns {JobResult} - Empty job result used for
   */
  get resultProxy () {
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
   * @returns {Promise<JobRevision>} - New job revision
   * @throws {TypeError}
   * @throws {ApiError}
   */
  async save (object = {}, layers = null) {
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

    const response = await this.api.axios.post(this.baseUrl, data);

    return new JobRevision(this.api, response.data.data);
  }

  /**
   * Get job object
   * @returns {Promise<Object>} - The map object
   * @throws {ApiError}
   * @todo document object format
   */
  async object () {
    const { data: { data } } = await this.api.axios.get(`${this.url}/object`);

    return data;
  }

  /**
   * Build the revision
   * @param {String} callbackUrl - Optional callback url for when the job completes
   * @throws {ApiError}
   */
  async build (callbackUrl) {
    await this.api.axios.post(`${this.url}/build`, { callbackUrl });
  }

  /**
   * Cancels a running job
   */
  async cancel () {
    await this.api.axios.post(`${this.url}/cancel`);
  }

  /**
   * Share the job revision
   * @param {String} visibility - See {@link JobShareVisibility}, either `private` or `organisation`
   * @returns {Promise<String>} - the share link
   * @throws {ApiError}
   */
  async share (visibility = JobShare.visibility.PRIVATE) {
    visibility = visibility.toLowerCase();

    if (visibility !== JobShare.visibility.ORGANISATION &&
      visibility !== JobShare.visibility.PRIVATE) {
      throw new Error(`Unknown visibility '${visibility}'`);
    }

    const { data: { data } } = await this.api.axios.post(`${this.url}/share`, { visibility });

    return data.url;
  }

  /**
   * Clones a job revision to the user requesting it
   * @throws {ApiError}
   */
  async clone () {
    await this.api.axios.post(`${this.url}/clone`);
  }
}
