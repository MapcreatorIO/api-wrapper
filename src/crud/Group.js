import CrudBase from './base/CrudBase';
import User from './User';
import Permission from './Permission';

export default class Group extends CrudBase {
  /**
   * Get a list of users in the group
   * @returns {Promise} - Resolves with {@link PaginatedResourceListing} instance containing {@link User} instances and rejects with {@link OAuthError}
   */
  users() {
    return this._listResource(User);
  }

  /**
   * Get the list of permissions granted to the group
   * @returns {Promise} - Resolves with {@link PaginatedResourceListing} instance containing {@link Permission} instances and rejects with {@link OAuthError}
   */
  permissions() {
    return this._listResource(Permission);
  }

  get resourceName() {
    return 'groups';
  }
}
