import CrudBase from './base/CrudBase';

export default class Feature extends CrudBase {
  constructor(api, data = {}) {
    super(api, data);

    this.path = '/features/{id}';
  }
}
