import CrudBase from './base/CrudBase';
import OwnableResource from '../traits/OwnableResource';
import {mix} from '../utils/reflection';

/**
 * Color resource
 * @extends {CrudBase}
 * @extends {OwnableResource}
 */
export default class Color extends mix(CrudBase, OwnableResource) {
  get resourceName() {
    return 'colors';
  }
}
