import {isParentOf, Trait} from '../utils/reflection';

/**
 * Provides a {@link ResourceBase} with functions for dealing with being ownable by an organisation
 * @mixin
 */
export default class OwnableResource extends Trait {
  /**
   *
   * @returns {Promise} - Promise will resolve with {@link Array<Organisation>} and reject with an {@link ApiError} instance.
   */
  organisations() {
    // This is a hack to fix a circular dependency issue
    const Organisation = require('../crud/Organisation').default;

    return this._listResource(Organisation, `${this.url}/organisations`);
  }

  /**
   * Sync items to the organisation
   * @param {Array<ResourceBase>} items - List of items to sync
   * @returns {Promise} - Promise will resolve with no value and reject with an {@link ApiError} instance.
   */
  syncOrganisations(items) {
    return this._modifyOrganisationLink(items, 'PATCH');
  }

  /**
   * Attach items to the organisation
   * @param {Array<ResourceBase>} items - List of items to attach
   * @returns {Promise} - Promise will resolve with no value and reject with an {@link ApiError} instance.
   */
  attachOrganisations(items) {
    return this._modifyOrganisationLink(items, 'POST');
  }

  /**
   * Unlink items from the organisation
   * @param {Array<Organisation>|Array<Number>} items - List of items to unlink
   * @returns {Promise} - Promise will resolve with no value and reject with an {@link ApiError} instance.
   */
  unlinkOrganisations(items) {
    return this._modifyOrganisationLink(items, 'DELETE');
  }

  /**
   * Sync, attach or unlink resources
   * @param {Array<Organisation>|Array<Number>} items - List of items to sync or attach
   * @param {String} method - Http method to use
   * @returns {Promise} - Promise will resolve with no value and reject with an {@link ApiError} instance.
   * @private
   */
  _modifyOrganisationLink(items, method) {
    // This is a hack to fix a circular dependency issue
    const Organisation = require('../crud/Organisation').default;
    const filter = x => !isParentOf(Organisation, x) && !isParentOf(Number, x);
    const isValid = items.filter(filter).length === 0;

    if (!isValid) {
      throw new TypeError('Array must contain either Numbers (organisationId) or Organisations.');
    }

    const keys = items.map(x => typeof x === 'number' ? x : x.organisationId);

    return this.api.request(`${this.url}/organisations`, method, {keys});
  }

  /**
   * If the resource can be owned by an organisation
   * @returns {boolean} - Can be owned by an organisation
   */
  get ownable() {
    return true;
  }
}
