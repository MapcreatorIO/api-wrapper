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
