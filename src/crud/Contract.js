import CrudBase from './base/CrudBase';

export default class Contract extends CrudBase {
  constructor(api, data = {}) {
    super(api, data);

    this.path = '/contracts/{id}';
  }
}
