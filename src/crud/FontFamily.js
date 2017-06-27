import CrudSetBase from './base/CrudSetBase';
import Font from './Font';

export default class FontFamily extends CrudSetBase {
  get resourcePath() {
    return '/fonts/families/{id}';
  }

  get resourceName() {
    return 'font-families';
  }

  get ownable() {
    return true;
  }

  get _Child() {
    return Font;
  }
}
