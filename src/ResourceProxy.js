import {isParentOf} from './utils/reflection';
import ResourceBase from './crud/base/ResourceBase';
import PaginatedResourceListing from './PaginatedResourceListing';

export default class ResourceProxy {
  constructor(api, Target) {
    if (!isParentOf(ResourceBase, Target)) {
      throw new TypeError('Target is not a child of CrudBase');
    }

    if (typeof Target !== 'function') {
      throw new TypeError('Target must to be a class not an instance');
    }

    this.api = api;
    this.Target = Target;
  }

  get accessorName() {
    return this.Target.name.toLowerCase();
  }

  list(page = 1, perPage = null) {
    const url = this.new().baseUrl;
    const resolver = new PaginatedResourceListing(this.api, url, this.Target);

    return resolver.getPage(page, perPage);
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

  select(id) {
    return this.new({id: id});
  }

  new(data = {}) {
    return new this.Target(this.api, data);
  }
}
