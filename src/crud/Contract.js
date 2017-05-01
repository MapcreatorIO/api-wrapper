import CrudBase from './base/CrudBase';

export default class Contract extends CrudBase {
  constructor(api, data = {}) {
    super(api, data);

    this.resourceName = 'contracts';
    this.path = '/' + this.resourceName + '/{id}';
  }
}
