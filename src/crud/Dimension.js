import CrudBase from './base/CrudBase';

/**
 * Dimension resource
 */
export default class Dimension extends CrudBase {
  get path() {
    return '/' + this.resourceName + '/{id}';
  }

  get resourceName() {
    return 'dimensions';
  }
}
