import CrudBase from './base/CrudBase';
import Permission from './Permission';
import User from './User';
import {isParentOf} from '../utils/reflection';

export default class Role extends CrudBase {
  /**
   * Get the list permissions linked to the role
   * @returns {SimpleResourceProxy} - A proxy for accessing the resource
   */
  get permissions() {
    return this._proxyResourceList(Permission);
  }

  /**
   * Get the list users linked to the role
   * @returns {SimpleResourceProxy} - A proxy for accessing the resource
   */
  get users() {
    return this._proxyResourceList(User);
  }

  get resourceName() {
    return 'roles';
  }

  /**
   * Sync permissions to the role
   * @param {Array<ResourceBase>} items - List of items to sync
   * @returns {Promise} - Promise will resolve with no value and reject with an {@link ApiError} instance.
   */
  syncPermissions(items) {
    return this._modifyLink(items, 'PATCH', Permission, 'permissions');
  }

  /**
   * Attach permissions to the role
   * @param {Array<ResourceBase>} items - List of items to attach
   * @returns {Promise} - Promise will resolve with no value and reject with an {@link ApiError} instance.
   */
  attachPermissions(items) {
    return this._modifyLink(items, 'POST', Permission, 'permissions');
  }

  /**
   * Detach permissions from the role
   * @param {Array<Organisation>|Array<Number>} items - List of items to unlink
   * @returns {Promise} - Promise will resolve with no value and reject with an {@link ApiError} instance.
   */
  detachPermissions(items) {
    return this._modifyLink(items, 'DELETE', Permission, 'permissions');
  }

  /**
   * Sync user to the role
   * @param {Array<ResourceBase>} items - List of items to sync
   * @returns {Promise} - Promise will resolve with no value and reject with an {@link ApiError} instance.
   */
  syncUsers(items) {
    return this._modifyLink(items, 'PATCH', User, 'users');
  }

  /**
   * Attach user to the role
   * @param {Array<ResourceBase>} items - List of items to attach
   * @returns {Promise} - Promise will resolve with no value and reject with an {@link ApiError} instance.
   */
  attachUsers(items) {
    return this._modifyLink(items, 'POST', User, 'users');
  }

  /**
   * Detach user from the role
   * @param {Array<Organisation>|Array<Number>} items - List of items to unlink
   * @returns {Promise} - Promise will resolve with no value and reject with an {@link ApiError} instance.
   */
  detachUsers(items) {
    return this._modifyLink(items, 'DELETE', User, 'users');
  }

  /**
   * Sync, attach or unlink resources
   * @param {Array<Organisation>|Array<Number>} items - List of items to sync or attach
   * @param {String} method - Http method to use
   * @param {Constructor} Type - Resource type
   * @param {String} path - Appended resource path
   * @returns {Promise} - Promise will resolve with no value and reject with an {@link ApiError} instance.
   * @todo refactor to CrudBase and remove organisation specific method from trait
   * @todo implicit path generation
   * @private
   */
  _modifyLink(items, method, Type, path) {
    const filter = x => !isParentOf(Type, x) && !isParentOf(Number, x);
    const isValid = items.filter(filter).length === 0;

    if (!isValid) {
      throw new TypeError(`Array must contain either Numbers (resource id) or ${Type.name}.`);
    }

    const keys = items.map(x => typeof x === 'number' ? x : x.id).map(Number);

    return this.api.request(`${this.url}/${path}`, method, {keys});
  }
}
