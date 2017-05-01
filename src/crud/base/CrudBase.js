import {AbstractClassError} from '../../exceptions/AbstractError';
import ResourceBase from './ResourceBase';

/**
 * @abstract
 */
export default class CrudBase extends ResourceBase {
  constructor(api, data = {}) {
    super(api, data);

    if (this.constructor === CrudBase) {
      throw new AbstractClassError();
    }
  }

  _buildCreateData() {
    const out = this.properties;

    for (const key of Object.keys(this.baseProperties)) {
      if (this[key] !== null) {
        out[key] = this[key];
      }
    }

    delete out.id;
    return out;
  }

  _listResource(Target, url = null) {
    if (!url) {
      url = `${this.url}/${(new Target()).resourceName}`;
    }

    return new Promise((resolve, reject) => {
      this.api.request(url)
        .catch(reject)
        .then(data => resolve(data.map(row => {
          return new Target(this.api, row);
        })));
    });
  }

  save() {
    return !this.id ? this._create() : this._update();
  }

  _create() {
    return new Promise((resolve, reject) => {
      this.api
        .request(this.baseUrl, 'POST', this._buildCreateData())
        .catch(reject)
        .then(data => {
          this.properties = {};
          this.baseProperties = data;

          resolve(this);
        });
    });
  }

  _update() {
    return new Promise((resolve, reject) => {
      this.api
        .request(this.url, 'PATCH', this.properties)
        .catch(reject)
        .then(() => resolve(this));
    });
  }

  delete() {
    return this.api.request(this.url, 'DELETE');
  }

  restore() {
    return this.api.request(this.url, 'PUT');
  }
}
