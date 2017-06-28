import CrudBase from './base/CrudBase';
import {OwnableResource} from '../traits/OwnableResource';
import {mix} from 'mixwith/src/mixwith';

/**
 * Color resource
 * @extends CrudBase
 */
export default class Color extends mix(CrudBase).with(OwnableResource) {
  get resourceName() {
    return 'colors';
  }
}
