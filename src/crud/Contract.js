import CrudBase from './base/CrudBase';

/**
 * Contract resource
 */
export default class Contract extends CrudBase {
  get path() {
    return '/' + this.resourceName + '/{id}';
  }

  get resourceName() {
    return 'contracts';
  }
}
