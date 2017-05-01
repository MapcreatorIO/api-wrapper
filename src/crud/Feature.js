import CrudBase from './base/CrudBase';

export default class Feature extends CrudBase {
  constructor(api, data = {}) {
    super(api, data);

    this.resourceName = 'features';
    this.path = '/' + this.resourceName + '/{id}';
  }

  get ownable() {
    return true;
  }
}
