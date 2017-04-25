import {snakeToCamelCase} from '../util/caseConverter';
import {AbstractClassError} from '../exceptions/AbstractError';

/**
 * @abstract
 */
export default class CrudBase {
  constructor(apiBase, data = {}) {
    if (this.constructor === CrudBase) {
      throw new AbstractClassError();
    }

    this.baseProperties = data;
    this.properties = {};
    this.apiBase = apiBase;
    this.path = '/'; // should be overwritten by child

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
    let url = `${this.apiBase.host}/${this.apiBase.version}${this.path}`;

    for (const key of Object.keys(this.baseProperties)) {
      url = url.replace(`{${key}}`, this[key]);
    }

    return url;
  }

  save() {

  }

  delete() {

  }

  restore() {

  }
}
