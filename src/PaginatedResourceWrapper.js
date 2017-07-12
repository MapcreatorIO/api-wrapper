import PaginatedResourceListing from './PaginatedResourceListing';
/* eslint-disable no-trailing-spaces */
import ResourceCache from './ResourceCache';
import ResourceBase from './crud/base/ResourceBase';

/**
 * Used for wrapping {@link PaginatedResourceListing} to make it spa friendly
 */
export default class PaginatedResourceWrapper {
  /**
   *
   * @param {PaginatedResourceListing} listing - Listing result
   * @param {Maps4News} api - Instance of the api
   * @param {Boolean} cacheEnabled - If the pagination cache should be used
   * @param {Number} cacheTime - Amount of seconds to store a value in cache
   * @param {Boolean} shareCache - Share cache across instances
   */
  constructor(listing, api = listing.api, cacheEnabled = api.defaults.cacheEnabled, cacheTime = api.defaults.cacheSeconds, shareCache = api.defaults._shareCache) {

    // Fields
    this._api = api;
    this.cacheEnabled = cacheEnabled;
    this.cacheTime = cacheTime;
    this._shareCache = shareCache;
    this._currentPage = 1;

    // Internal
    this._localCache = new ResourceCache(api, cacheTime);
    this._cache = this._shareCache ? this.api.cache : this._localCache;
    this._inflight = [];

    this._promiseCallback(listing);
  }

  get _promiseCallback() {
    return result => {
      this._currentPage = result.page;

      const query = this.query;

      this._last = result;
      this._query = query;

      this.cache.push(result);

      const inflightId = this.inflight.findIndex(x => x === result.page);

      if (inflightId >= 0) {
        this._inflight.splice(inflightId, 1);
      }

      this.rebuild();
    };
  }

  get(id) {
    if (id instanceof Array) {
      id.map(this.get);
    } else {
      this._inflight.push(id);
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

  refresh(flush = false) {
    if (flush) {
      this.cache.clear(this.path);
    }

    this.cache
      .collectPages(this.path, this._last.cacheToken)
      .map(page => this.get(page.page));
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
    this.rebuild();
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

  get hasNext() {
    return this.inflight === 0 ? this._last.hasNext : this.currentPage < this.pageCount;
  }

  get hasPrevious() {
    return this._last.hasPrevious;
  }

  get inflight() {
    return this._inflight;
  }
}
