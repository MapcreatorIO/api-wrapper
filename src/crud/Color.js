import CrudBase from './base/CrudBase';

export default class Color extends CrudBase {
  constructor(api, data = {}) {
    super(api, data);

    this.resourceName = 'colors';
    this.path = '/' + this.resourceName + '/{id}';

  }

  get ownable() {
    return true;
  }
}
