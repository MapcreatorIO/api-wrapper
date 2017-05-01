import {snakeToCamelCase} from '../../utils/caseConverter';
import {AbstractClassError} from '../../exceptions/AbstractError';
import {isParentOf} from '../../utils/reflection';
import Maps4News from '../../Maps4News';

/**
 * @abstract
 */
export default class ResourceBase {
  constructor(api, data = {}) {
    if (this.constructor === ResourceBase) {
      throw new AbstractClassError();
    }

    if (!isParentOf(Maps4News, api)) {
      throw new TypeError('Expected api to be of type Maps4News');
    }

    this.baseProperties = data;
    this.properties = {};
    this.api = api;
    this.path = '/';
    this.resourceName = '';

    this._applyProperties();
  }

  refresh() {
    return new Promise((resolve, reject) => {
      this.api.request(this.url)
        .catch(reject)
        .then(data => {
          this.properties = {};
          this.baseProperties = data;

          resolve(this);
        });
    });
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

  get ownable() {
    return false;
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
