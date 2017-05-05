import CrudBase from './base/CrudBase';

/**
 * Dimension resource
 */
export default class Dimension extends CrudBase {
  get resourceName() {
    return 'dimensions';
  }
}
