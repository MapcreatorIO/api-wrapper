import CrudBase from './base/CrudBase';
import JobResult from './JobResult';
import JobRevision from './JobRevision';

export default class Job extends CrudBase {
  /**
   * Get the list of associated job results
   * @returns {Promise} - Resolves with {@link PaginatedResourceListing} instance containing {@link JobResult} instances and rejects with {@link OAuthError}
   */
  results() {
    return this._listResource(JobResult, this.url + '/results');
  }

  /**
   * Get the list job revisions
   * @returns {Promise} - Resolves with {@link PaginatedResourceListing} instance containing {@link JobRevision} instances and rejects with {@link OAuthError}
   */
  revisions() {
    return this._listResource(JobRevision, this.url + '/revisions');
  }

  get path() {
    return '/' + this.resourceName + '/{id}';
  }

  get resourceName() {
    return 'jobs';
  }
}
