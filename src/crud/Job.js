import CrudBase from './base/CrudBase';
import JobResult from './JobResult';
import JobRevision from './JobRevision';

export default class Job extends CrudBase {
  constructor(api, data = {}) {
    super(api, data);

    this.resourceName = 'jobs';
    this.path = '/' + this.resourceName + '/{id}';
  }

  results() {
    return this._listResource(JobResult, this.url + '/results');
  }

  revisions() {
    return this._listResource(JobRevision, this.url + '/revisions');
  }
}
