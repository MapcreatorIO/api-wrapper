import CrudSetBase from './base/CrudSetBase';
import Font from './Font';
import {mix} from 'mixwith/src/mixwith';
import {OwnableResource} from '../traits/OwnableResource';

/**
 * Font family
 * @extends CrudBase
 */
export default class FontFamily extends mix(CrudSetBase).with(OwnableResource) {
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
