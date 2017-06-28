import CrudBase from './base/CrudBase';
import {mix} from 'mixwith/src/mixwith';
import {OwnableResource} from '../traits/OwnableResource';

/**
 * Feature
 * @extends CrudBase
 */
export default class Feature extends mix(CrudBase).with(OwnableResource) {
  get resourceName() {
    return 'features';
  }
}
