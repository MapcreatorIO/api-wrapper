/**
 * Dimension sets
 */
import CrudSetBase from './base/CrudSetBase';
import Dimension from './Dimension';
import {mix} from 'mixwith/src/mixwith';
import {OwnableResource} from '../traits/OwnableResource';

export default class DimensionSet extends mix(CrudSetBase).with(OwnableResource) {
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
