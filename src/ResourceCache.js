/*
 * BSD 3-Clause License
 *
 * Copyright (c) 2017, MapCreator
 * All rights reserved.
 *
 * Redistribution and use in source and binary forms, with or without
 * modification, are permitted provided that the following conditions are met:
 *
 *  Redistributions of source code must retain the above copyright notice, this
 *   list of conditions and the following disclaimer.
 *
 *  Redistributions in binary form must reproduce the above copyright notice,
 *   this list of conditions and the following disclaimer in the documentation
 *   and/or other materials provided with the distribution.
 *
 *  Neither the name of the copyright holder nor the names of its
 *   contributors may be used to endorse or promote products derived from
 *   this software without specific prior written permission.
 *
 * THIS SOFTWARE IS PROVIDED BY THE COPYRIGHT HOLDERS AND CONTRIBUTORS "AS IS"
 * AND ANY EXPRESS OR IMPLIED WARRANTIES, INCLUDING, BUT NOT LIMITED TO, THE
 * IMPLIED WARRANTIES OF MERCHANTABILITY AND FITNESS FOR A PARTICULAR PURPOSE ARE
 * DISCLAIMED. IN NO EVENT SHALL THE COPYRIGHT HOLDER OR CONTRIBUTORS BE LIABLE
 * FOR ANY DIRECT, INDIRECT, INCIDENTAL, SPECIAL, EXEMPLARY, OR CONSEQUENTIAL
 * DAMAGES (INCLUDING, BUT NOT LIMITED TO, PROCUREMENT OF SUBSTITUTE GOODS OR
 * SERVICES; LOSS OF USE, DATA, OR PROFITS; OR BUSINESS INTERRUPTION) HOWEVER
 * CAUSED AND ON ANY THEORY OF LIABILITY, WHETHER IN CONTRACT, STRICT LIABILITY,
 * OR TORT (INCLUDING NEGLIGENCE OR OTHERWISE) ARISING IN ANY WAY OUT OF THE USE
 * OF THIS SOFTWARE, EVEN IF ADVISED OF THE POSSIBILITY OF SUCH DAMAGE.
 */

import mitt from 'mitt';
import Uuid from './utils/uuid';

/**
 * Used for caching resources. Requires the resource to have an unique id field
 * @see {@link PaginatedResourceWrapper}
 * @todo Add periodic data refreshing while idle, most likely implemented in cache
 */
export default class ResourceCache {
  constructor(api, cacheTime = api.defaults.cacheSeconds) {
    this._api = api;
    this.cacheTime = cacheTime;
    this.emitter = mitt();

    this._storage = {};

    // Prevent observers
    Object.freeze(this);
  }

  /**
   * Push a page into the cache
   * @param {PaginatedResourceListing} page - Data to be cached
   * @param {boolean} [diff=false] - Differential result used for updating the cache. Cache entry won't be used to for key dropping.
   * @returns {void}
   * @todo diff documentation
   */
  push(page, diff = false) {
    if (page.rows === 0) {
      return; // Don't insert empty pages
    }

    delete page.__ob__; // Remove VueJs observer
    Object.freeze(page);

    // Test if this is data we can actually work with by testing if there are any non-numeric ids (undefined etc)
    const invalidData = page.data.map(row => row.id).filter(x => typeof x !== 'number').length > 0;

    if (invalidData) {
      throw new TypeError('Missing or invalid row.id for page.data. Data rows must to contain a numeric "id" field.');
    }

    const validThrough = this._timestamp() + this.cacheTime;
    const cacheId = Uuid.uuid4();
    const data = {
      page, validThrough, diff,
      id: cacheId,
      timeout: setTimeout(
        () => this._deleteCacheIds(cacheId),
        this.cacheTime * 1000,
      ),
    };

    const storage = this._storage[page.route] || (this._storage[page.route] = {});

    (storage[page.cacheToken] || (storage[page.cacheToken] = [])).push(data);

    this.emitter.emit('push', {page, validThrough, resourceUrl: page.route});
    this.emitter.emit('invalidate', {resourceUrl: page.route});
  }

  /**
   * Delete from cache using cacheId
   * @param {String|Array<String>} ids - cache ids
   * @returns {void}
   */
  _deleteCacheIds(ids) {
    if (!(ids instanceof Array)) {
      this._deleteCacheIds([ids]);
      return;
    }

    let found = 0;

    for (const resourceUrl of Object.keys(this._storage)) {
      for (const token of Object.keys(this._storage[resourceUrl])) {
        const entries = this._storage[resourceUrl][token];

        for (let i = 0; i < entries.length; i++) {
          if (ids.includes(entries[i].id)) {
            entries.splice(i, 1);
            i--;
            found++;

            if (found === ids.length) {
              return;
            }
          }
        }
      }
    }
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
    cacheToken = cacheToken.toLowerCase();

    // Storage array or []
    const storage = (this._storage[resourceUrl] || {})[cacheToken] || [];

    // Sort by validThrough and extract pages
    return storage.sort((a, b) => a.validThrough - b.validThrough);
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
   * @param {Boolean} dereference - Dereference output data by cloning the instances before returning them.
   * @see {@link PaginatedResourceListing#cacheToken}
   * @returns {Array} - Indexed relevant data
   * @todo add page numbers or range as optional parameter
   */
  resolve(resourceUrl, cacheToken = '', dereference = this._api.defaults.dereferenceCache) {
    cacheToken = cacheToken.toLowerCase();

    const data = this.collectPages(resourceUrl, cacheToken);
    const out = [];

    let lastStart;
    let lastEnd;
    let lastPage;

    for (const row of data) {
      const page = row.page;

      if (page.rows === 0) {
        // We can't do anything if we don't have any data
        continue;
      }

      const ids = page.data.map(row => row.id);
      const startId = Math.min(...ids);
      const endId = Math.max(...ids);

      const badKeys = [];

      if (page.page - 1 === lastPage || page.page === lastPage) {
        badKeys.push(...this._diffRange(lastEnd, startId));
      }

      if (page.page + 1 === lastPage || page.page === lastPage) {
        badKeys.push(...this._diffRange(endId, lastStart));
      }

      lastStart = startId;
      lastEnd = endId;

      for (const row of page.data) {
        out[row.id] = row;
      }

      if (!row.diff) {
        // Grab list of applicable ids and delete offending
        // keys that no longer exist in the newer data set
        Object
          .keys(out)
          .map(Number)
          .filter(key => startId <= key && key <= endId)
          .filter(key => !ids.includes(key))
          .forEach(key => badKeys.push(key));
      }

      badKeys.forEach(key => delete out[key]);
    }

    if (dereference) {
      return out.map(x => x.clone());
    }

    return out;
  }

  /**
   * Update records in the cache manually lazily. Any matching instance found will be updated.
   * @param {ResourceBase|Array<ResourceBase>} rows - Data to be updated
   * @returns {void} - nothing
   */
  update(rows) {
    if (!(rows instanceof Array)) {
      this.update([rows]);
      return;
    }

    // Split up data into types
    const data = {};
    const ids = {};

    for (const row of rows) {
      const key = row.constructor.name;

      (data[key] || (data[key] = [])).push(row);
      (ids[key] || (ids[key] = [])).push(row.id);
    }

    const models = Object.keys(data);

    for (const resourceUrl of Object.keys(this._storage)) {
      let invalidate = false;

      for (const token of Object.keys(this._storage[resourceUrl])) {
        const entries = this._storage[resourceUrl][token];

        for (const entry of entries) {
          const page = entry.page;

          if (page.data.length === 0) {
            continue;
          }

          const key = page.data[0].constructor.name;

          if (!models.includes(key)) {
            break;
          }

          for (const row of page.data) {
            if (!ids[key].includes(row.id)) {
              continue;
            }

            const index = ids[key].findIndex(x => x === row.id);
            const value = data[key][index];

            value.sanitize();

            value.fieldNames.forEach(x => {
              row[x] = value[x];
            });

            invalidate = true;
          }
        }
      }

      if (invalidate) {
        this.emitter.emit('invalidate', {resourceUrl: resourceUrl});
      }
    }
  }

  /**
   * Used for key elimination. Calculates the keys between two indexes.
   * @param {Number} start - Start index
   * @param {Number} end - End index
   * @returns {Array} - keys
   * @private
   * @example
   * cache._diffRange(1, 5) === [2, 3, 4]
   */
  _diffRange(start, end) {
    if (start > end) {
      const _x = end;

      end = start;
      start = _x;
    }

    if (start === end || start - end === 1) {
      return [];
    }

    const out = [];

    for (let i = start + 1; i < end; i++) {
      out.push(i);
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
