import CrudBase from './CrudBase';

export default class Contract extends CrudBase {
  constructor(api, data = {}) {
    super(api, data);

    this.path = '/contracts/{id}';
  }
}
