import CrudBase from './base/CrudBase';

export default class FontFamily extends CrudBase {
  get path() {
    return '/fonts/families/{id}';
  }

  get resourceName() {
    return 'font-families';
  }

  get ownable() {
    return true;
  }
}
