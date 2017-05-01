import CrudBase from './base/CrudBase';

export default class JobResult extends CrudBase {
  constructor(api, data = {}) {
    super(api, data);

    this.resourceName = 'job-result';
    this.path = '/jobs/{job_id}/revisions/{job_revision_id}/result';
  }

  get archiveUrl() {
    return `${this.url}/archive`;
  }

  get previewUrl() {
    return `${this.url}/preview`;
  }
}
