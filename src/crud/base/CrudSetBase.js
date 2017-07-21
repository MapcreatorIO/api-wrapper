import CrudBase from './CrudBase';
import {AbstractError} from '../../exceptions/AbstractError';

/**
 * Crud base for resource sets
 * @abstract
 */
export default class CrudSetBase extends CrudBase {

  /**
   * Get items associated with the set
   * @returns {Promise} - Resolves with {@link PaginatedResourceListing} instance containing {@link Notification} instances and rejects with {@link ApiError}
   */
  items() {
    const url = `${this.url}/items`;

    return this._listResource(this._Child, url);
  }

  /**
   * Child constructor
   * @returns {ResourceBase} - Child constructor
   * @constructor
   * @abstract
   * @protected
   */
  get _Child() {
    throw new AbstractError();
  }
}
