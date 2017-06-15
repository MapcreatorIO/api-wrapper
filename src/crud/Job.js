import CrudBase from './base/CrudBase';
import JobResult from './JobResult';
import JobRevision from './JobRevision';

export default class Job extends CrudBase {
  /**
   * Get the list of associated job results
   * @returns {Promise} - Resolves with {@link PaginatedResourceListing} instance containing {@link JobResult} instances and rejects with {@link OAuthError}
   */
  results() {
    return this._listResource(JobResult, `${this.url}/results`);
  }

  /**
   * Get the list job revisions
   * @returns {Promise} - Resolves with {@link PaginatedResourceListing} instance containing {@link JobRevision} instances and rejects with {@link OAuthError}
   */
  revisions() {
    return this._listResource(JobRevision, `${this.url}/revisions`);
  }

  /**
   * Get revision by id
   * @param {string} id - Revision id
   * @returns {Promise} -  Resolves with {@link JobRevision} instance and rejects with {@link OAuthError}
   */
  getRevision(id = 'last') {
    return new Promise((resolve, reject) => {
      this._api
        .request(`${this.path}/revisions/${id}`)
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
    return `${this.path}/revisions/last/result/preview`;
  }

  /**
   * Get the most up to date archive url
   * @returns {string} - Last archive url
   */
  get lastArchiveUrl() {
    return `${this.path}/revisions/last/result/archive`;
  }
}
