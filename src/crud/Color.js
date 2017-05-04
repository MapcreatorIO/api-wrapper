import CrudBase from './base/CrudBase';

/**
 * Color resource
 */
export default class Color extends CrudBase {
  get path() {
    return '/' + this.resourceName + '/{id}';
  }

  get resourceName() {
    return 'colors';
  }

  get ownable() {
    return true;
  }
}
