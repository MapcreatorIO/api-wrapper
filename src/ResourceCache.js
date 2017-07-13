import mitt from 'mitt';


/**
 * Used for caching resources
 * @see {@link PaginatedResourceWrapper}
 */
export default class ResourceCache {
  constructor(api, cacheTime = api.defaults.cacheSeconds) {
    this._api = api;
    this.cacheTime = cacheTime;
    this.emitter = mitt();

    // page.route => page.query stringified =>
    // Array<{page: PaginatedResourceListing, timeout: revalidateTimeout}>
    this.clear();

    // cache invalidation should fire an event for rebuilding data
    // this should only be done once after revalidate()
    // push should send an event for rebuilding
  }

  /**
   * Push a page into the cache
   * @param {PaginatedResourceListing} page - Data to be cached
   * @returns {void}
   */
  push(page) {
    const validThrough = this._timestamp() + this.cacheTime;
    const data = {
      page, validThrough,
      timeout: setTimeout(
        () => this.revalidate(page.url),
        this.cacheTime * 1000,
      ),
    };

    const storage = this._storage[page.url] || (this._storage[page.url] = {});

    (storage[page.cacheToken] || (storage[page.cacheToken] = [])).push(data);

    this.emitter.emit('push', {page, validThrough});
    this.emitter.emit('invalidate', {resourceUrl: page.url});
  }

  /**
   * Revalidate all data and delete stale data
   * @param {String} resourceUrl - Resource url
   * @returns {void}
   */
  revalidate(resourceUrl = null) {
    if (!resourceUrl) {
      Object.keys(this._storage).map(this.revalidate);
    } else if (this._storage[resourceUrl]) {
      const storage = this._storage[resourceUrl];

      // Remove old data from the cache and stop old timeouts
      Object.keys(storage).forEach(key => {
        storage[key]
          .filter(row => row.validThrough < this._timestamp())
          .forEach(row => clearTimeout(row.timeout));

        storage[key] = storage[key].filter(row => row.validThrough >= this._timestamp());
      });

      const junk = Object.keys(storage).filter(key => storage[key].length === 0);

      // Delete empty
      junk.forEach(key => delete storage[key]);
      if (Object.keys(storage).length === 0) {
        delete this._storage[resourceUrl];
      }

      if (junk.length > 0) {
        this.emitter.emit('invalidate', {resourceUrl});
      }
    }
  }

  /**
   * Collect relevant cached pages
   * @param {String} resourceUrl - resource url
   * @param {String} cacheToken - Cache token
   * @see {@link PaginatedResourceListing#cacheToken}
   * @returns {Array<PaginatedResourceListing>} - Relevant cached pages
   */
  collectPages(resourceUrl, cacheToken = '') {
    const storage = this._storage[resourceUrl] || {};

    return [].concat(
      ...Object
        .keys(storage)
        .filter(x => !cacheToken || x === cacheToken)
        .map(key => storage[key]))
      .sort((a, b) => a.validThrough - b.validThrough)
      .map(x => x.page);
  }

  /**
   * Clears the cache
   * @param {String} resourceUrl - Resource url
   * @returns {void}
   */
  clear(resourceUrl = '') {
    if (!resourceUrl) {
      Object.keys(this._storage).forEach(url => {
        this.emitter.emit('invalidate', {resourceUrl: url});
      });

      this._storage = {};
    } else {
      delete this._storage[resourceUrl];
      this.emitter.emit('invalidate', {resourceUrl});
    }
  }

  /**
   * Resolve cache and return indexed data
   * @param {String} resourceUrl - Resource url
   * @param {String} cacheToken - Cache token
   * @see {@link PaginatedResourceListing#cacheToken}
   * @returns {Array} - Indexed relevant data
   */
  resolve(resourceUrl, cacheToken = '') {
    cacheToken = cacheToken.toLowerCase();

    const data = this.collectPages(resourceUrl, cacheToken);
    const out = [];

    for (const page of data) {
      const ids = page.data.map(row => row.id);
      const startId = Math.min(...ids);
      const endId = Math.max(...ids);

      for (const row of page.data) {
        out[row.id] = row;
      }

      // Grab list of applicable ids and delete offending
      // keys that no longer exist in the newer data set
      Object
        .keys(out)
        .map(Number)
        .filter(key => startId <= key && key <= endId)
        .filter(key => !ids.includes(key))
        .forEach(key => delete out[key]);
    }

    return out;
  }

  /**
   * Get a usable timestamp
   * @returns {number} - timestamp
   * @private
   */
  _timestamp() {
    return Math.floor(Date.now() / 1000);
  }
}
