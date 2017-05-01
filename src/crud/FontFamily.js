import CrudBase from './base/CrudBase';

export default class FontFamily extends CrudBase {
  constructor(api, data = {}) {
    super(api, data);


    this.resourceName = 'font-families';
    this.path = '/fonts/families/{id}';
  }

  get ownable() {
    return true;
  }
}
