import {AbstractClassError} from '../../exceptions/AbstractError';
import ResourceBase from './ResourceBase';
import PaginatedResourceListing from '../../PaginatedResourceListing';

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

  _listResource(Target, url = null, page = 1, perPage = null) {
    if (!url) {
      url = `${this.url}/${(new Target(this.api)).resourceName}`;
    }

    const resolver = new PaginatedResourceListing(this.api, url, Target);

    return resolver.getPage(page, perPage);
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
