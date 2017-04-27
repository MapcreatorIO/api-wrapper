import {snakeToCamelCase} from '../util/caseConverter';
import {AbstractClassError} from '../exceptions/AbstractError';

/**
 * @abstract
 */
export default class ResourceBase {
  constructor(api, data = {}) {
    if (this.constructor === ResourceBase) {
      throw new AbstractClassError();
    }

    this.baseProperties = data;
    this.properties = {};
    this.api = api;
    this.path = '/';

    this._applyProperties();
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
}
