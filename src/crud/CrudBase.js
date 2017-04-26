import {snakeToCamelCase} from '../util/caseConverter';
import {AbstractClassError} from '../exceptions/AbstractError';

/**
 * @abstract
 */
export default class CrudBase {
  constructor(api, data = {}) {
    if (this.constructor === CrudBase) {
      throw new AbstractClassError();
    }

    this.baseProperties = data;
    this.properties = {};
    this.api = api;

    this._applyProperties();
  }

  static get path() {
    return '/';
  }

  _applyProperties() {
    for (const key of Object.keys(this.baseProperties)) {
      Object.defineProperty(this, snakeToCamelCase(key), {
        enumerable: true,
        configurable: true,

        get: () => {
          if (this.properties.hasOwnProperty(key)) {
            return this.properties[key];
          }

          return this.baseProperties[key];
        },

        set: (val) => {
          this.properties[key] = val;
          return val;
        },
      });
    }
  }

  _buildPostData() {
    const out = this.properties;

    for (const key of Object.keys(this.baseProperties)) {
      if (this[key] !== null) {
        out[key] = this[key];
      }
    }

    delete out.id;
    return out;
  }

  get url() {
    let url = `${this.api.host}/${this.api.version}${this.path}`;

    for (const key of Object.keys(this.baseProperties)) {
      url = url.replace(`{${key}}`, this[key]);
    }

    return url;
  }

  get baseUrl() {
    const basePath = this.path.match(/^(\/[^{]+\b)/)[1];

    return `${this.api.host}/${this.api.version}${basePath}`;
  }

  save() {
    const method = !this.id ? 'POST' : 'PATCH';
    const data = !this.id ? this._buildPostData() : this.properties;
    const url = !this.id ? this.baseUrl : this.url;

    return new Promise((resolve, reject) => {
      // No data should be returned on success to the user since
      // the object is already the same as the expected response.
      this.api
        .request(url, method, data)
        .then(() => resolve())
        .catch(reject);
    });
  }

  delete() {
    return this.api.request(this.url, 'DELETE');
  }

  restore() {
    return this.api.request(this.url, 'PUT');
  }
}
