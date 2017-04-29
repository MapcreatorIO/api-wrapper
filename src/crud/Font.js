import CrudBase from './base/CrudBase';

export default class Font extends CrudBase {
  constructor(api, data = {}) {
    super(api, data);

    this.path = '/fonts/{id}';
  }
}
