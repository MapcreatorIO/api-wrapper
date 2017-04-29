import CrudBase from './base/CrudBase';

export default class Color extends CrudBase {
  constructor(api, data = {}) {
    super(api, data);

    this.path = '/colors/{id}';
  }
}
