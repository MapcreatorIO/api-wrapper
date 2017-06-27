import CrudBase from './base/CrudBase';

export default class JobType extends CrudBase {
  get resourcePath() {
    return '/jobs/types/{id}';
  }

  get resourceName() {
    return 'job-types';
  }

  get ownable() {
    return true;
  }
}
