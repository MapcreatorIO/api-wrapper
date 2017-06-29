import CrudSetBase from './base/CrudSetBase';
import Dimension from './Dimension';
import OwnableResource from '../traits/OwnableResource';
import {mix} from '../utils/reflection';


/**
 * Dimension sets
 * @extends {CrudSetBase}
 * @extends {OwnableResource}
 */
export default class DimensionSet extends mix(CrudSetBase, OwnableResource) {
  get resourcePath() {
    return '/dimensions/sets/{id}';
  }

  get resourceName() {
    return 'dimension-sets';
  }

  get _Child() {
    return Dimension;
  }
}
