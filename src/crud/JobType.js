import CrudBase from './base/CrudBase';

export default class JobType extends CrudBase {
  constructor(api, data = {}) {
    super(api, data);

    this.resourceName = 'job-types';
    this.path = '/jobs/types/{id}';
  }

  get ownable() {
    return true;
  }
}
