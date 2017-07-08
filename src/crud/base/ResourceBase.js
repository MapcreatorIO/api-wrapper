import {AbstractClassError, AbstractError} from '../../exceptions/AbstractError';
import Maps4News from '../../Maps4News';
import {camelToSnakeCase, pascalToCamelCase, snakeToCamelCase} from '../../utils/caseConverter';
import {isParentOf} from '../../utils/reflection';

/**
 * Resource base
 * @abstract
 */
export default class ResourceBase {
  /**
   * @param {Maps4News} api - Api instance
   * @param {Object<String, *>} data - Item data
   */
  constructor(api, data = {}) {
    if (this.constructor === ResourceBase) {
      throw new AbstractClassError();
    }

    if (!isParentOf(Maps4News, api)) {
      throw new TypeError('Expected api to be of type Maps4News');
    }

    // Normalize keys to snake_case
    Object.keys(data).map(key => {
      const newKey = camelToSnakeCase(pascalToCamelCase(key));

      if (newKey !== key) {
        data[newKey] = data[key];
        delete data[key];
      }
    });

    this._baseProperties = data;
    this._properties = {};
    this._api = api;

    this._applyProperties();
  }

  /**
   * Get api instance
   * @returns {Maps4News} - Api instance
   */
  get api() {
    return this._api;
  }

  /**
   * Resource path template
   * @returns {String} - Path template
   */
  get resourcePath() {
    return `/${this.resourceName}/\{id}`;
  }

  /**
   * Resource name
   * @returns {String} - Resource name
   * @abstract
   */
  get resourceName() {
    throw new AbstractError();
  }

  /**
   * Refresh the resource by requesting it from the server again
   * @param {Boolean} updateSelf - Update the current instance
   * @returns {Promise} - Resolves with {@link ResourceBase} instance and rejects with {@link ApiError}
   */
  refresh(updateSelf = true) {
    return new Promise((resolve, reject) => {
      this._api.request(this.url)
        .catch(reject)
        .then(data => {
          if (updateSelf) {
            this._properties = {};
            this._baseProperties = data;
          }

          resolve(new this(this._api, data));
        });
    });
  }

  /**
   * Creates proxies for the properties
   * @returns {void}
   * @private
   */
  _applyProperties() {
    const protectedFields = ['id', 'created_at', 'updated_at', 'deleted_at'];
    const fields = Object.keys(this._baseProperties);

    for (const key of fields) {
      const desc = {
        enumerable: true,
        configurable: true,

        get: () => {
          if (this._properties.hasOwnProperty(key)) {
            return this._properties[key];
          }

          return this._baseProperties[key];
        },
      };

      if (!protectedFields.includes(key)) {
        // eslint-disable-next-line no-return-assign
        desc.set = val => this._properties[key] = val;
      }

      Object.defineProperty(this, snakeToCamelCase(key), desc);
    }

    // Add deleted field if possible
    if (fields.includes('deleted_at')) {
      Object.defineProperty(this, 'deleted', {
        enumerable: true,
        configurable: true,

        get: () => {
          return Boolean(this.deletedAt);
        },
      });
    }
  }

  /**
   * If the resource can be owned by an organisation
   * @returns {boolean} - Can be owned by an organisation
   */
  get ownable() {
    return false;
  }

  /**
   * Auto generated resource url
   * @returns {string} - Resource url
   */
  get url() {
    let url = `${this._api.host}/${this._api.version}${this.resourcePath}`;

    for (const key of Object.keys(this._baseProperties)) {
      url = url.replace(`{${key}}`, this[key]);
    }

    return url;
  }

  /**
   * Auto generated Resource base url
   * @returns {string} - Resource base url
   */
  get baseUrl() {
    const basePath = this.resourcePath.match(/^(\/[^{]+\b)/)[1];

    return `${this._api.host}/${this._api.version}${basePath}`;
  }

  /**
   * List fields that contain object data
   * @returns {Array<String>} - A list of fields
   */
  get fieldNames() {
    return Object
      .keys(this._baseProperties)
      .map(snakeToCamelCase);
  }

  /**
   * String representation of the resource, similar to Python's __repr__
   * @returns {string} - Resource name and id
   */
  toString() {
    return `${this.constructor.name}(${this.id})`;
  }
}
