import {isParentOf} from './utils/reflection';
import ResourceBase from './crud/base/ResourceBase';

export default class ResourceProxy {
  constructor(api, target) {
    if (!isParentOf(ResourceBase, target)) {
      throw new TypeError('Target is not a child of CrudBase');
    }

    if (typeof target !== 'function') {
      throw new TypeError('Target must to be a class not an instance');
    }

    this.api = api;
    this.Target = target;
  }

  get accessorName() {
    return this.Target.name.toLowerCase();
  }

  list() {
    const url = this.new().baseUrl;

    return new Promise((resolve, reject) => {
      this.api.request(url)
        .catch(reject)
        .then(data => resolve(data.map(this.new)));
    });
  }

  get(id) {
    const url = this.new({id: id}).url;

    return new Promise((resolve, reject) => {
      this.api
        .request(url)
        .catch(reject)
        .then(data => resolve(this.new(data)));
    });
  }

  new(data = {}) {
    return new this.Target(this.api, data);
  }
}
