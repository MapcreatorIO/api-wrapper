import CrudBase from './base/CrudBase';
import Layer from './Layer';
import JobShare from './JobShare';
import JobResult from './JobResult';

export default class JobRevision extends CrudBase {
  get baseUrl() {
    return `/jobs/${this['job_id']}/revisions`;
  }

  get path() {
    return '/jobs/{job_id}/revisions/{id}';
  }

  get resourceName() {
    return 'job-revisions';
  }

  /**
   * Save updated job revision
   * @returns {void}
   * @todo unimplemented
   */
  save() {
    throw new Error('Unimplemented');
  }

  /**
   * Get job object
   * @returns {Promise} - Resolves with {@link Object} instance containing the map object and rejects with {@link OAuthError}
   * @todo document object format
   */
  object() {
    const url = `${this.url}/object`;

    return this.api.request(url);
  }

  /**
   * Build the revision
   * @param {String} callbackUrl - Optional callback url for when the job completes
   * @returns {Promise} - Resolves with an empty {@link Object} and rejects with {@link OAuthError}
   */
  build(callbackUrl) {
    const url = `${this.url}/build`;
    const data = {callback: callbackUrl};

    return this.api.request(url, 'POST', data);
  }

  /**
   * Cancels a running job
   * @returns {Promise} - Resolves with an empty {@link Object} and rejects with {@link OAuthError}
   */
  cancel() {
    const url = `${this.url}/cancel`;

    return this.api.request(url, 'POST');
  }

  /**
   * Get layers
   * @returns {Promise} - Resolves with {@link PaginatedResourceListing} instance containing {@link Layer} instances and rejects with {@link OAuthError}
   */
  layers() {
    return this._listResource(Layer);
  }

  /**
   * Share the job revision
   * @param {String} visibility - See {@link JobShareVisibility}, either `private` or `organisation`
   * @returns {Promise} - Resolves with a {@link String} containing the share link and rejects with {@link OAuthError}
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
   * Get the job result
   * @returns {Promise} - Resolves with a {@link JobResult} instance and rejects with {@link OAuthError}
   */
  result() {
    const url = `${this.url}/result`;

    return new Promise((resolve, reject) => {
      this.api.request(url)
        .catch(reject)
        .then(data => resolve(new JobResult(data)));
    });
  }
}
