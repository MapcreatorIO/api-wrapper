import CrudBase from './base/CrudBase';

/**
 * Contract resource
 */
export default class Contract extends CrudBase {
  get resourceName() {
    return 'contracts';
  }
}
