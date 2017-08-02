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
import JobResult from './JobResult';
import JobRevision from './JobRevision';

export default class Job extends CrudBase {
  /**
   * Get the list of associated job results
   * @returns {Promise} - Resolves with {@link PaginatedResourceListing} instance containing {@link JobResult} instances and rejects with {@link ApiError}
   */
  results() {
    return this._listResource(JobResult, `${this.url}/results`);
  }

  /**
   * Get the list job revisions
   * @returns {Promise} - Resolves with {@link PaginatedResourceListing} instance containing {@link JobRevision} instances and rejects with {@link ApiError}
   */
  revisions() {
    return this._listResource(JobRevision, `${this.url}/revisions`);
  }

  /**
   * Get revision by id
   * @param {string} id - Revision id
   * @returns {Promise} -  Resolves with {@link JobRevision} instance and rejects with {@link ApiError}
   */
  getRevision(id = 'last') {
    return new Promise((resolve, reject) => {
      this._api
        .request(`${this.resourcePath}/revisions/${id}`)
        .catch(reject)
        .then(data => resolve(new JobRevision(this._api, data)));
    });
  }

  get resourceName() {
    return 'jobs';
  }

  /**
   * Get the most up to date preview url
   * @returns {string} - Last preview url
   */
  get lastPreviewUrl() {
    return `${this.resourcePath}/revisions/last/result/preview`;
  }

  /**
   * Get the most up to date archive url
   * @returns {string} - Last archive url
   */
  get lastArchiveUrl() {
    return `${this.resourcePath}/revisions/last/result/archive`;
  }
}
