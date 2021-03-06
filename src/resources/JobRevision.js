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

import { isParentOf } from '../utils/reflection';
import CrudBase from './base/CrudBase';
import JobResult from './JobResult';
import JobShare from './JobShare';
import Layer from './Layer';
import RequestParameters from '../RequestParameters';
import { encodeQueryString } from '../utils/requests';
import { DeletedState } from '../enums';
import { makeCancelable } from '../utils/helpers';

export default class JobRevision extends CrudBase {
  get baseUrl () {
    return `${this._api.url}/jobs/${this.jobId}/revisions`;
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
   * @param {String} [deleted=RequestParameters.deleted] - Determines if the resource should be shown if deleted, requires special resource permissions. Possible values: only, none, all
   * @returns {CancelablePromise<JobResult>} - The associated job result
   * @throws {ApiError} - If the api returns errors
   */
  result (deleted = RequestParameters.deleted || DeletedState.NONE) {
    return makeCancelable(async signal => {
      const url = `${this.url}/result?${encodeQueryString({ deleted })}`;
      const { data } = await this.api.ky.get(url, { signal }).json();

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
   * @param {String} [deleted=RequestParameters.deleted] - Determines if the resource should be shown if deleted, requires special resource permissions. Possible values: only, none, all
   * @returns {CancelablePromise<JobRevision>} - New job revision
   * @throws {TypeError}
   * @throws {ApiError} - If the api returns errors
   */
  save (object = {}, layers = null, deleted = RequestParameters.deleted || DeletedState.NONE) {
    if (layers && layers.length > 0) {
      if (isParentOf(Layer, layers[0])) {
        layers = layers.map(layer => layer.id);
      } else if (typeof layers[0] !== 'number') {
        throw new TypeError('layers property is not of type Array<Layer>, Array<Number> or null');
      }
    }

    const json = {
      'object': JSON.stringify(object),
      'language_code': this.languageCode,
      'mapstyle_set_id': this.mapstyleSetId,
    };

    if (layers) {
      json.layers = layers;
    }

    const url = `${this.baseUrl}?${encodeQueryString({ deleted })}`;

    return makeCancelable(async signal => {
      const { data } = await this.api.ky.post(url, { json, signal }).json();

      return new JobRevision(this.api, data);
    });
  }

  /**
   * Get job object
   * @param {String} [deleted=RequestParameters.deleted] - Determines if the resource should be shown if deleted, requires special resource permissions. Possible values: only, none, all
   * @returns {CancelablePromise<Object>} - The map object
   * @throws {ApiError} - If the api returns errors
   */
  object (deleted = RequestParameters.deleted || DeletedState.NONE) {
    const url = `${this.url}/object?${encodeQueryString({ deleted })}`;

    return makeCancelable(async signal => {
      const { data } = await this.api.ky.get(url, { signal }).json();

      return data;
    });
  }

  /**
   * Build the revision
   * @param {String} callback - Optional callback url for when the job completes
   * @param {String} [deleted=RequestParameters.deleted] - Determines if the resource should be shown if deleted, requires special resource permissions. Possible values: only, none, all
   * @throws {ApiError} - If the api returns errors
   * @returns {CancelablePromise}
   */
  build (callback, deleted = RequestParameters.deleted || DeletedState.NONE) {
    const url = `${this.url}/build?${encodeQueryString({ deleted })}`;

    return makeCancelable(async signal => {
      await this.api.ky.post(url, { json: { callback }, signal });
    });
  }

  /**
   * Cancels a running job
   * @param {String} [deleted=RequestParameters.deleted] - Determines if the resource should be shown if deleted, requires special resource permissions. Possible values: only, none, all
   * @returns {CancelablePromise}
   * @throws {ApiError} - If the api returns errors
   */
  cancel (deleted = RequestParameters.deleted || DeletedState.NONE) {
    const url = `${this.url}/cancel?${encodeQueryString({ deleted })}`;

    return makeCancelable(async signal => {
      await this.api.ky.post(url, { signal });
    });
  }

  /**
   * Share the job revision
   * @param {String} visibility - See {@link JobShareVisibility}, either `private` or `organisation`
   * @param {String} [deleted=RequestParameters.deleted] - Determines if the resource should be shown if deleted, requires special resource permissions. Possible values: only, none, all
   * @returns {CancelablePromise<JobShareResponse>} - Object containing share links
   * @throws {ApiError} - If the api returns errors
   */
  share (visibility = JobShare.visibility.PRIVATE, deleted = RequestParameters.deleted || DeletedState.NONE) {
    visibility = visibility.toLowerCase();

    if (visibility !== JobShare.visibility.ORGANISATION &&
      visibility !== JobShare.visibility.PRIVATE) {
      throw new Error(`Unknown visibility '${visibility}'`);
    }

    const url = `${this.url}/share?${encodeQueryString({ deleted })}`;

    return makeCancelable(async signal => {
      const { data } = await this.api.ky.post(url, { json: { visibility }, signal }).json();

      return data;
    });
  }

  // noinspection JSCheckFunctionSignatures
  /**
   * Clones a job revision to the user requesting it
   * @param {String} [title=null] - The new title for the job
   * @param {String} [deleted=RequestParameters.deleted] - Determines if the resource should be shown if deleted, requires special resource permissions. Possible values: only, none, all
   * @throws {ApiError} - If the api returns errors
   * @returns {CancelablePromise<JobRevision>} - The new job revision, which will be linked to a new job
   */
  clone (title = null, deleted = RequestParameters.deleted || DeletedState.NONE) {
    const url = `${this.url}/clone?${encodeQueryString({ deleted })}`;

    return makeCancelable(async signal => {
      const { data } = await this.api.ky.post(url, { json: { title }, signal }).json();

      return new JobRevision(this.api, data);
    });
  }
}

/**
 * Job Share response
 *
 * @typedef {Object} JobShareResponse
 * @property {string} web - Web link
 * @property {string} api - Api link
 * @property {string} hash - Share hash
 */
