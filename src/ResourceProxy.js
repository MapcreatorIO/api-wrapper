import {isParentOf} from './utils/reflection';
import ResourceBase from './crud/base/ResourceBase';
import PaginatedResourceListing from './PaginatedResourceListing';

/**
 * Proxy for accessing resource. This will make sure that they
 * are properly wrapped before the promise resolves.
 * @protected
 */
export default class ResourceProxy {
  /**
   * @param {Maps4News} api - Instance of the api
   * @param {ResourceBase} Target - Target to wrap
   */
  constructor(api, Target) {
    if (!isParentOf(ResourceBase, Target)) {
      throw new TypeError('Target is not a child of CrudBase');
    }

    if (typeof Target !== 'function') {
      throw new TypeError('Target must to be a class not an instance');
    }

    this._api = api;
    this._Target = Target;
  }

  /**
   * Get api instance
   * @returns {Maps4News} - Api instance
   */
  get api() {
    return this._api;
  }

  /**
   * Target to wrap results in
   * @returns {ResourceBase} - Target constructor
   * @constructor
   */
  get Target() {
    return this._Target;
  }

  /**
   * The name of the target
   * @returns {String} - Target name
   */
  get accessorName() {
    return this.Target.name.toLowerCase();
  }

  /**
   * Lists target resource
   * @param {Object<String, String|Array<String>>} query - Query
   * @param {Number} page - The page to be requested
   * @param {Number} perPage - Amount of items per page. This is silently capped by the API
   * @returns {Promise} - Resolves with {@link PaginatedResourceListing} instance and rejects with {@link OAuthError}
   *
   * @example
   * // Find layers with a name that starts with "test" and a scale_min between 1 and 10
   * // See Api documentation for search query syntax
   * var query = {
   *   name: '^:test',
   *   scale_min: ['>:1', '<:10'],
   * }
   *
   * api.layers.search(query).then(console.dir);
   */
  search(query, page = 1, perPage = null) {
    const url = this.new().baseUrl;
    const resolver = new PaginatedResourceListing(this._api, url, this.Target, query);

    return resolver.getPage(page, perPage);
  }

  /**
   * Lists target resource
   * @param {Number} page - The page to be requested
   * @param {Number} perPage - Amount of items per page. This is silently capped by the API
   * @returns {Promise} - Resolves with {@link PaginatedResourceListing} instance and rejects with {@link OAuthError}
   */
  list(page = 1, perPage = null) {
    return this.search({}, page, perPage);
  }

  /**
   * Get target resource
   * @param {Number|String} id - The resource id to be requested
   * @returns {Promise} - Resolves with {@link ResourceBase} instance and rejects with {@link OAuthError}
   */
  get(id) {
    const url = this.new({id: id}).url;

    return new Promise((resolve, reject) => {
      this._api
        .request(url)
        .catch(reject)
        .then(data => resolve(this.new(data)));
    });
  }

  /**
   * Select target resource without obtaining data
   * @param {Number|String} id - Resource id
   * @returns {ResourceBase} - Empty target resource
   * @example
   * api.users.select('me').colors().then(doSomethingCool);
   */
  select(id) {
    return this.new({id: id});
  }

  /**
   * Build a new isntance of the target
   * @param {Object<String, *>} data - Data for the object to be populated with
   * @returns {ResourceBase} - Resource with target data
   */
  new(data = {}) {
    return new this.Target(this._api, data);
  }
}
