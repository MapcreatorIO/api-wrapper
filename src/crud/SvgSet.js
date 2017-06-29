import OwnableResource from '../traits/OwnableResource';
import CrudSetBase from './base/CrudSetBase';
import Svg from './Svg';
import {mix} from '../utils/reflection';


/**
 * Svg set
 * @extends {CrudSetBase}
 * @extends {OwnableResource}
 */
export default class SvgSet extends mix(CrudSetBase, OwnableResource) {
  get resourcePath() {
    return '/svgs/sets/{id}';
  }

  get resourceName() {
    return 'svg-sets';
  }

  get _Child() {
    return Svg;
  }
}
