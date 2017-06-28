/**
 * Color resource
 */
import CrudBase from './base/CrudBase';
import {OwnableResource} from '../traits/OwnableResource';
import {mix} from 'mixwith/src/mixwith';

export default class Color extends mix(CrudBase).with(OwnableResource) {
  get resourceName() {
    return 'colors';
  }
}
