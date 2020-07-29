/*
 * BSD 3-Clause License
 *
 * Copyright (c) 2020, Mapcreator
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

import DownloadedResource from './base/DownloadedResource';
import ResourceBase from './base/ResourceBase';
import RequestParameters from '../RequestParameters';
import { encodeQueryString } from '../utils/requests';
import { DeletedState } from '../enums';

export default class JobResult extends ResourceBase {
  static get resourcePath () {
    return '/jobs/{job_id}/revisions/{revision}/result';
  }

  static get resourceName () {
    return 'job-result';
  }

  /**
   * Get the related job
   * @returns {Promise<Job, ApiError>} - The job related to this row
   */
  get job () {
    return this.api.jobs.get(this.jobId);
  }

  /**
   * Get the related job revision
   * @returns {Promise<JobRevision, ApiError>} - The job revision related to this row
   */
  get jobRevision () {
    return this.api.jobs.select(this.jobId).revisions.get(this.id);
  }

  /**
   * Job result archive url
   * @returns {string} - Archive url
   */
  get outputUrl () {
    return `${this.url}/output`;
  }

  /**
   * Get archive blob url
   * @param {String} [deleted=RequestParameters.deleted] - Determines if the resource should be shown if deleted, requires special resource permissions. Possible values: only, none, all
   * @returns {Promise<DownloadedResource>} - Job result output
   */
  async downloadOutput (deleted = RequestParameters.deleted ?? DeletedState.NONE) {
    const response = await this.api.axios.get(`${this.outputUrl}?${encodeQueryString({ deleted })}`, {
      responseType: 'arraybuffer',
    });

    return DownloadedResource.fromResponse(response);
  }

  /**
   * Get the output url url
   * @returns {string} - Output url url
   */
  get outputUrlUrl () {
    return `${this.url}/output-url`;
  }

  /**
   * Get the remote output url
   * @param {String} [deleted=RequestParameters.deleted] - Determines if the resource should be shown if deleted, requires special resource permissions. Possible values: only, none, all
   * @returns {Promise<string>} - The url to the output
   * @throws {ApiError}
   */
  async getOutputUrl (deleted = RequestParameters.deleted ?? DeletedState.NONE) {
    const url = `${this.outputUrlUrl}?${encodeQueryString({ deleted })}`;
    const { data } = await this.api.ky.get(url).json();

    return data.url;
  }

  /**
   * Job result log url
   * @returns {string} - log url
   */
  get logUrl () {
    return `${this.url}/log`;
  }

  /**
   * Download the job result log
   * @param {String} [deleted=RequestParameters.deleted] - Determines if the resource should be shown if deleted, requires special resource permissions. Possible values: only, none, all
   * @returns {Promise<DownloadedResource>} - job result log
   */
  async downloadLog (deleted = RequestParameters.deleted ?? DeletedState.NONE) {
    const response = await this.api.axios.get(`${this.logUrl}?${encodeQueryString({ deleted })}`, {
      responseType: 'arraybuffer',
    });

    return DownloadedResource.fromResponse(response);
  }

  /**
   * Job result preview url, usable in an `<img>` tag
   * @returns {string} - Preview url
   */
  get previewUrl () {
    return `${this.url}/preview`;
  }

  /**
   * Download the job preview
   * @param {String} [deleted=RequestParameters.deleted] - Determines if the resource should be shown if deleted, requires special resource permissions. Possible values: only, none, all
   * @returns {Promise<DownloadedResource>} - Job result preview
   */
  async downloadPreview (deleted = RequestParameters.deleted ?? DeletedState.NONE) {
    const response = await this.api.axios.get(`${this.previewUrl}?${encodeQueryString({ deleted })}`, {
      responseType: 'arraybuffer',
    });

    return DownloadedResource.fromResponse(response);
  }

  /**
   * Mark a job as dealt with
   * This method is for internal use for our support team.
   *
   * @param {boolean} [value=true] - What to set the dealt-with value to
   * @param {String} [deleted=RequestParameters.deleted] - Determines if the resource should be shown if deleted, requires special resource permissions. Possible values: only, none, all
   */
  async dealWith (value = true, deleted = RequestParameters.deleted ?? DeletedState.NONE) {
    value = Boolean(value);

    const method = value ? 'POST' : 'DELETE';
    const url = `${this.url}/deal-with?${encodeQueryString({ deleted })}`;

    await this.api.ky(url, { method });

    this.dealtWith = value;
  }
}
