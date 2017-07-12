/* eslint-disable no-trailing-spaces */
import ResourceCache from './ResourceCache';
import PaginatedResourceListing from './PaginatedResourceListing';

/**
 * Used for wrapping {@link PaginatedResourceListing} to make it spa friendly
 */
export default class PaginatedResourceWrapper {
  /**
   *
   * @param {PaginatedResourceListing|Promise<PaginatedResourceListing>} listing - Listing result
   * @param {Maps4News} api - Instance of the api
   * @param {Boolean} cacheEnabled - If the pagination cache should be used
   * @param {Number} cacheTime - Amount of seconds to store a value in cache
   * @param {Boolean} shareCache - Share cache across instances
   */
  constructor(listing, api = listing.api, cacheEnabled = api.defaults.cacheEnabled, cacheTime = api.defaults.cacheSeconds, shareCache = api.defaults._shareCache) {
    this._api = api;

    if (listing instanceof Promise) {
      listing.then(this._promiseCallback);
    } else if (listing instanceof PaginatedResourceListing) {
      this._promiseCallback(listing);
    }

    this.cacheEnabled = cacheEnabled;
    this.cacheTime = cacheTime;
    this._shareCache = shareCache;

    this._localCache = new ResourceCache(api, cacheTime);
    this._cache = this._shareCache ? this.api.cache : this._localCache;

    // Don't grab it through a proxy to the last list
    // This can introduce race conditions
    this._currentPage = 1;

    // Build data
    this.rebuild();
  }

  _promiseCallback(result) {
    this._currentPage = result.page;
    this.cache.push(result);

    this._last = result;
    delete this._last.data; // Save some memory

    this.rebuild();
  }

  get(id) {
    if (id instanceof Array) {
      id.map(this.get);
    } else {
      this._last.getPage(id).then(this._promiseCallback);
    }
  }

  next() {
    this.get(++this.currentPage);
  }

  previous() {
    this.get(--this.currentPage);
  }

  rebuild() {
    this.data = this.cache.resolve(this.path, this._last.cacheToken);
    this.dataFiltered = this.data.filter(value => typeof value !== 'undefined');
  }

  get currentPage() {
    return this._currentPage;
  }

  set currentPage(value) {
    this._currentPage = Math.max(1, value);
  }

  get path() {
    return this._last.path;
  }

  get pageCount() {
    return this._last.pageCount;
  }

  get query() {
    return this._last.query;
  }

  set query(value) {
    this._last.query = value;
  }

  get api() {
    return this._api;
  }

  get cache() {
    return this._cache;
  }

  get shareCache() {
    return this._shareCache;
  }

  set shareCache(value) {
    this._shareCache = Boolean(value);

    this._cache = this._shareCache ? this.api.cache : this._localCache;
  }
}
