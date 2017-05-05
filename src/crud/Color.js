import CrudBase from './base/CrudBase';

/**
 * Color resource
 */
export default class Color extends CrudBase {
  get resourceName() {
    return 'colors';
  }

  get ownable() {
    return true;
  }
}
