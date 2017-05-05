import CrudSetBase from './base/CrudSetBase';
import Dimension from './Dimension';

/**
 * Dimension sets
 */
export default class DimensionSet extends CrudSetBase {
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
