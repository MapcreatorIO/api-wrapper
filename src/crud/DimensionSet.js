import CrudBase from './base/CrudBase';
import Dimension from './Dimension';

/**
 * Dimension sets
 */
export default class DimensionSet extends CrudBase {
  get path() {
    return '/dimensions/sets/{id}';
  }

  get resourceName() {
    return 'dimension-sets';
  }

  get ownable() {
    return true;
  }

  get _Child() {
    return Dimension;
  }
}
