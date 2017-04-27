import CrudBase from './CrudBase';

export default class Feature extends CrudBase {
  constructor(api, data = {}) {
    super(api, data);

    this.path = '/features/{id}';
  }
}
