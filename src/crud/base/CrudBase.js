import {AbstractClassError} from '../../exceptions/AbstractError';
import ResourceBase from './ResourceBase';
import PaginatedResourceListing from '../../PaginatedResourceListing';

/**
 * Base of all resource items that support Crud operations
 * @abstract
 */
export default class CrudBase extends ResourceBase {
  /**
   * @param {Maps4News} api - Api instance
   * @param {Object<String, *>} data - Item data
   */
  constructor(api, data = {}) {
    super(api, data);

    if (this.constructor === CrudBase) {
      throw new AbstractClassError();
    }
  }

  /**
   * Build data for create operation
   * @returns {Object<String, *>} - Create data
   * @protected
   */
  _buildCreateData() {
    const out = this._properties;

    for (const key of Object.keys(this._baseProperties)) {
      if (this[key] !== null) {
        out[key] = this[key];
      }
    }

    delete out.id;
    return out;
  }

  /**
   * Macro for resource listing
   * @param {ResourceBase} Target - Target object
   * @param {String} url - Target url, if not set it will guess
   * @param {Number} page - Page number
   * @param {Number} perPage - Amount of items per page
   * @returns {Promise} - Resolves with {@link PaginatedResourceListing} instance and rejects with {@link OAuthError}
   * @protected
   */
  _listResource(Target, url = null, page = 1, perPage = null) {
    if (!url) {
      url = `${this.url}/${(new Target(this.api)).resourceName}`;
    }

    const resolver = new PaginatedResourceListing(this.api, url, Target);

    return resolver.getPage(page, perPage);
  }

  /**
   * Save item. This will create a new item if `id` is unset
   * @returns {Promise} - Resolves with {@link CrudBase} instance and rejects with {@link OAuthError}
   */
  save() {
    return !this.id ? this._create() : this._update();
  }

  /**
   * Store new item
   * @returns {Promise} - Resolves with {@link CrudBase} instance and rejects with {@link OAuthError}
   * @private
   */
  _create() {
    return new Promise((resolve, reject) => {
      this.api
        .request(this.baseUrl, 'POST', this._buildCreateData())
        .catch(reject)
        .then(data => {
          this._properties = {};
          this._baseProperties = data;

          resolve(this);
        });
    });
  }

  /**
   * Update existing item
   * @returns {Promise} - Resolves with {@link CrudBase} instance and rejects with {@link OAuthError}
   * @private
   */
  _update() {
    return new Promise((resolve, reject) => {
      this.api
        .request(this.url, 'PATCH', this._properties)
        .catch(reject)
        .then(() => resolve(this));
    });
  }

  /**
   * Delete item
   * @returns {Promise} - Resolves with an empty {@link Object} and rejects with {@link OAuthError}
   */
  delete() {
    return this.api.request(this.url, 'DELETE');
  }

  /**
   * Restore item
   * @returns {Promise} - Resolves with {@link CrudBase} instance and rejects with {@link OAuthError}
   */
  restore() {
    return new Promise((resolve, reject) => {
      this.api.request(this.url, 'PUT')
        .catch(reject)
        .then(data => resolve(new this(this.api, data)));
    });
  }
}
