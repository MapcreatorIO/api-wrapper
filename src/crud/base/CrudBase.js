import {AbstractClassError} from '../../exceptions/AbstractError';
import PaginatedResourceListing from '../../PaginatedResourceListing';
import ResourceBase from './ResourceBase';

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
    const out = {};
    const keys = [].concat(
      Object.keys(this._properties),
      Object.keys(this._baseProperties),
    ).filter((item, pos, self) => self.indexOf(item) === pos);

    for (const key of keys) {
      out[key] = this._properties[key] || this._baseProperties[key];
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
   * @returns {Promise} - Resolves with {@link PaginatedResourceListing} instance and rejects with {@link ApiError}
   * @protected
   */
  _listResource(Target, url = null, page = 1, perPage = this.api.defaults.perPage) {
    if (!url) {
      const resource = (new Target(this.api)).resourceName.replace(/s+$/, '');

      url = `${this.url}/${resource}s`;
    }

    const resolver = new PaginatedResourceListing(this.api, url, Target);

    return resolver.getPage(page, perPage);
  }

  /**
   * Save item. This will create a new item if `id` is unset
   * @returns {Promise} - Resolves with {@link CrudBase} instance and rejects with {@link ApiError}
   */
  save() {
    return !this.id ? this._create() : this._update();
  }

  /**
   * Store new item
   * @returns {Promise} - Resolves with {@link CrudBase} instance and rejects with {@link ApiError}
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
   * @returns {Promise} - Resolves with {@link CrudBase} instance and rejects with {@link ApiError}
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
   * @returns {Promise} - Resolves with an empty {@link Object} and rejects with {@link ApiError}
   */
  delete() {
    return this.api.request(this.url, 'DELETE');
  }

  /**
   * Restore item
   * @returns {Promise} - Resolves with {@link CrudBase} instance and rejects with {@link ApiError}
   */
  restore() {
    return new Promise((resolve, reject) => {
      this.api.request(this.url, 'PUT')
        .catch(reject)
        .then(data => resolve(new this(this.api, data)));
    });
  }
}
