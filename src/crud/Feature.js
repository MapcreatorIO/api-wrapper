import CrudBase from './base/CrudBase';
import OwnableResource from '../traits/OwnableResource';
import {mix} from '../utils/reflection';


/**
 * Feature
 * @extends {CrudSetBase}
 * @extends {OwnableResource}
 */
export default class Feature extends mix(CrudBase, OwnableResource) {
  get resourceName() {
    return 'features';
  }
}
