import CrudBase from './base/CrudBase';

export default class Job extends CrudBase {
  constructor(api, data = {}) {
    super(api, data);

    this.path = '/jobs/{id}';
  }
}
