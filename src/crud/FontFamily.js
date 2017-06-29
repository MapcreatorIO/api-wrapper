import OwnableResource from '../traits/OwnableResource';
import {mix} from '../utils/reflection';
import CrudSetBase from './base/CrudSetBase';
import Font from './Font';

/**
 * Font family
 * @extends {CrudSetBase}
 * @extends {OwnableResource}
 */
export default class FontFamily extends mix(CrudSetBase, OwnableResource) {
  get resourcePath() {
    return '/fonts/families/{id}';
  }

  get resourceName() {
    return 'font-families';
  }

  get _Child() {
    return Font;
  }
}
