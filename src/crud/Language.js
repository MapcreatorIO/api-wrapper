import CrudBase from './base/CrudBase';

export default class Language extends CrudBase {
  constructor(api, data = {}) {
    super(api, data);

    this.resourceName = 'languages';
    this.path = '/' + this.resourceName + '/{id}';
  }
}
