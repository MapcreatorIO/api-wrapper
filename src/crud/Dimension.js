import CrudBase from './base/CrudBase';

export default class Dimension extends CrudBase {
  constructor(api, data = {}) {
    super(api, data);

    this.path = '/dimensions/{id}';
  }
}
