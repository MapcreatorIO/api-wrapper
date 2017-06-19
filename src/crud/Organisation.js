import CrudBase from './base/CrudBase';
import Color from './Color';
import Contract from './Contract';
import DimensionSet from './DimensionSet';
import Feature from './Feature';
import FontFamily from './FontFamily';
import JobShare from './JobShare';
import JobType from './JobType';
import Layer from './Layer';
import MapstyleSet from './MapstyleSet';
import SvgSet from './SvgSet';
import User from './User';

export default class Organisation extends CrudBase {
  /**
   * Sync items to the organisation
   * @param {Array<ResourceBase>} items - List of items to sync
   * @returns {Array<Promise>} - Array containing promises for each item type. Each will resolve with an empty {@link Object} and reject with an {@link ApiError} instance.
   */
  sync(items) {
    return this._modifyResourceLink(items, 'PATCH');
  }

  /**
   * Attach items to the organisation
   * @param {Array<ResourceBase>} items - List of items to attach
   * @returns {Array<Promise>} - Array containing promises for each item type Each will resolve with no value and reject with an {@link ApiError} instance.
   */
  attach(items) {
    return this._modifyResourceLink(items, 'POST');
  }

  /**
   * Unlink items from the organisation
   * @param {Array<ResourceBase>} items - List of items to unlink
   * @returns {Array<Promise>} - Array containing promises for each item type Each will resolve with no value and reject with an {@link ApiError} instance.
   */
  unlink(items) {
    return this._modifyResourceLink(items, 'DELETE');
  }

  /**
   * Sync, attach or unlink resources
   * @param {Array<ResourceBase>} items - List of items to sync or attach
   * @param {String} method - Http method to use
   * @returns {Array<Promise>} - Array containing promises for each item type Each will resolve with no value and reject with an {@link ApiError} instance.
   * @private
   */
  _modifyResourceLink(items, method) {
    const collections  = this._reduceOwnable(items);
    const out = [];

    for (const key of Object.keys(collections)) {
      const url = `${this.url}/${key}`;
      const data = {keys: collections[key]};
      const promise = this.api.request(url, method, data);

      out.push(promise);
    }

    return out;
  }

  /**
   * Reduce the items to a more usable list
   * @param {Array<ResourceBase>} items - List of items to reduce
   * @returns {Object<String, Array<Number>>} - Object keys are resource names and the value is an array containing ids to sync/attach
   * @private
   */
  _reduceOwnable(items) {
    const out = {};

    for (const row of items) {
      if (!row.ownable) {
        continue;
      }

      const key = row.resourceName;

      if (!out[key]) {
        out[key] = [row.id];
      } else {
        out[key].push(row.id);
      }
    }

    return out;
  }

  get resourceName() {
    return 'organisations';
  }

  // Resource listing
  /**
   * Get the list font families linked to the organisation
   * @returns {Promise} - Resolves with {@link PaginatedResourceListing} instance containing {@link FontFamily} instances and rejects with {@link OAuthError}
   */
  fontFamilies() {
    return this._listResource(FontFamily);
  }

  /**
   * Get the list dimension sets linked to the organisation
   * @returns {Promise} - Resolves with {@link PaginatedResourceListing} instance containing {@link DimensionSet} instances and rejects with {@link OAuthError}
   */
  dimensionSets() {
    return this._listResource(DimensionSet);
  }

  /**
   * Get the list mapstyle sets linked to the organisation
   * @returns {Promise} - Resolves with {@link PaginatedResourceListing} instance containing {@link MapstyleSet} instances and rejects with {@link OAuthError}
   */
  mapstyleSets() {
    return this._listResource(MapstyleSet);
  }

  /**
   * Get the list svg sets linked to the organisation
   * @returns {Promise} - Resolves with {@link PaginatedResourceListing} instance containing {@link SvgSet} instances and rejects with {@link OAuthError}
   */
  svgSets() {
    return this._listResource(SvgSet);
  }

  /**
   * Get the list colors linked to the organisation
   * @returns {Promise} - Resolves with {@link PaginatedResourceListing} instance containing {@link Color} instances and rejects with {@link OAuthError}
   */
  colors() {
    return this._listResource(Color);
  }

  /**
   * Get the list features linked to the organisation
   * @returns {Promise} - Resolves with {@link PaginatedResourceListing} instance containing {@link Feature} instances and rejects with {@link OAuthError}
   */
  features() {
    return this._listResource(Feature);
  }

  /**
   * Get the list layers linked to the organisation
   * @returns {Promise} - Resolves with {@link PaginatedResourceListing} instance containing {@link Layer} instances and rejects with {@link OAuthError}
   */
  layers() {
    return this._listResource(Layer);
  }

  /**
   * Get the list job types linked to the organisation
   * @returns {Promise} - Resolves with {@link PaginatedResourceListing} instance containing {@link JobType} instances and rejects with {@link OAuthError}
   */
  jobTypes() {
    return this._listResource(JobType);
  }

  /**
   * Get the list job shares linked to the organisation
   * @returns {Promise} - Resolves with {@link PaginatedResourceListing} instance containing {@link JobShare} instances and rejects with {@link OAuthError}
   */
  jobShares() {
    return this._listResource(JobShare);
  }

  /**
   * Get the list users linked to the organisation
   * @returns {Promise} - Resolves with {@link PaginatedResourceListing} instance containing {@link User} instances and rejects with {@link OAuthError}
   */
  users() {
    return this._listResource(User);
  }

  /**
   * Get the list contracts linked to the organisation
   * @returns {Promise} - Resolves with {@link PaginatedResourceListing} instance containing {@link Contract} instances and rejects with {@link OAuthError}
   */
  contracts() {
    return this._listResource(Contract);
  }
}
