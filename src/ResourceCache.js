import mitt from 'mitt';

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

  push(page) {
    const data = {
      page: page,
      timeout: setTimeout(
        () => this.revalidate(page.url),
        this.cacheTime * 1000,
      ),
      validThrough: this._timestamp() + this.cacheTime,
    };

    const storage = this._storage[page.url] || (this._storage[page.url] = {});

    (storage[page.cacheToken] || (storage[page.cacheToken] = [])).push(data);
  }

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

      // Delete empty
      Object.keys(storage)
        .filter(key => storage[key].length === 0)
        .forEach(key => delete storage[key]);

      if (Object.keys(storage).length === 0) {
        delete this._storage[resourceUrl];
      }
    }
  }

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

  clear(url = '') {
    if (!url) {
      this._storage = {};
    } else {
      this._storage[url] = {};
    }
  }

  resolve(url, token = '') {
    token = token.toLowerCase();

    const data = this.collectPages(url, token);
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

  _timestamp() {
    return Math.floor(Date.now() / 1000);
  }
}
