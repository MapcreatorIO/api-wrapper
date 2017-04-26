import {isParentOf} from './util/reflection';
import CrudBase from './crud/CrudBase';

export default class ResourceProxy {
  constructor(api, Target) {
    if (isParentOf(CrudBase, Target)) {
      throw new TypeError('Target is not a child of CrudBase');
    } else if (typeof Target !== 'function') {
      throw new TypeError('Target must to be a class not an instance');
    }

    this.api = api;
    this.Target = Target;
  }

  get accesorName() {
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
        .then(data => resolve(new this(this.api, data)));
    });
  }

  new(data = {}) {
    return new this.Target(this.api, data);
  }
}
