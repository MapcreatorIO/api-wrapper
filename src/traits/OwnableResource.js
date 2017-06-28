import ResourceBase from '../crud/base/ResourceBase';
import Organisation from '../crud/Organisation';
import {isParentOf} from '../utils/reflection';

export const OwnableResource = superclass =>
  /**
   * @mixin
   */
  class OwnableResource extends superclass {
  constructor(...args) {
    super(...args);

    if (!isParentOf(ResourceBase, this)) {
      throw new TypeError(`Trait ${this.constructor.name} requires class to be child of ResourceBase`);
    }
  }

  /**
   *
   * @returns {Promise}
   */
  organisations() {
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
    const isValid = items.filter(x => !isParentOf(Organisation, x)).length === 0;

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
};
