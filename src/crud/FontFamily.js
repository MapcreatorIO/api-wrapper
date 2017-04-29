import CrudBase from './base/CrudBase';

export default class FontFamily extends CrudBase {
  constructor(api, data = {}) {
    super(api, data);

    this.path = '/fonts/families/{id}';
  }
}
