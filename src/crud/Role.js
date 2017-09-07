import CrudBase from './base/CrudBase';
import Permission from './Permission';
import User from './User';

export default class Role extends CrudBase {
  /**
   * Get the list permissions linked to the role
   * @returns {Promise} - Resolves with {@link PaginatedResourceListing} instance containing {@link Permission} instances and rejects with {@link ApiError}
   */
  permissions() {
    return this._listResource(Permission);
  }

  /**
   * Get the list users linked to the role
   * @returns {Promise} - Resolves with {@link PaginatedResourceListing} instance containing {@link User} instances and rejects with {@link ApiError}
   */
  users() {
    return this._listResource(User);
  }

  get resourceName() {
    return 'roles';
  }
}
