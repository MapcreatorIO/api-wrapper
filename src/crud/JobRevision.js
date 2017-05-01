import CrudBase from './base/CrudBase';
import Layer from './Layer';
import JobShare from './JobShare';
import JobResult from './JobResult';

export default class JobRevision extends CrudBase {
  constructor(api, data = {}) {
    super(api, data);

    this.resourceName = 'job-revisions';
    this.path = '/jobs/{job_id}/revisions/{id}';
  }

  get baseUrl() {
    return '/jobs/{job_id}/revisions'.replace('job_id', this['job_id']);
  }

  save() {
    // TODO build save revision
  }

  object() {
    const url = `${this.url}/object`;

    return this.api.request(url);
  }

  build(callbackUrl) {
    const url = `${this.url}/build`;
    const data = {callback: callbackUrl};

    return this.api.request(url, 'POST', data);
  }

  cancel() {
    const url = `${this.url}/cancel`;

    return this.api.request(url, 'POST');
  }

  layers() {
    return this._listResource(Layer);
  }

  share(visibility = JobShare.visibility.PRIVATE) {
    visibility = visibility.toLowerCase();

    if (visibility !== JobShare.visibility.ORGANISATION &&
        visibility !== JobShare.visibility.PRIVATE) {
      throw new Error(`Unknown visibility '${visibility}'`);
    }

    const url = `${this.url}/share`;

    return this.api.request(url, 'POST', {visibility});
  }

  result() {
    const url = `${this.url}/result`;

    return new Promise((resolve, reject) => {
      this.api.request(url)
        .catch(reject)
        .then(data => resolve(new JobResult(data)));
    });
  }
}
