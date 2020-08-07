/*
 * BSD 3-Clause License
 *
 * Copyright (c) 2020, Mapcreator
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

import { camel as camelCase, snake as snakeCase } from 'case';
import { AbstractClassError, AbstractError } from '../../errors/AbstractError';
import Mapcreator from '../../Mapcreator';
import SimpleResourceProxy from '../../proxy/SimpleResourceProxy';
import Injectable from '../../traits/Injectable';
import { fnv32b } from '../../utils/hash';
import { isParentOf, mix } from '../../utils/reflection';
import { makeCancelable } from '../../utils/helpers';

function unique (input) {
  return input.filter((v, i) => input.findIndex(vv => vv === v) === i);
}

/**
 * Resource base
 * @abstract
 */
export default class ResourceBase extends mix(null, Injectable) {
  /**
   * @param {Mapcreator} api - Api instance
   * @param {Object<String, *>} data - Item data
   */
  constructor (api, data = {}) {
    super();

    if (this.constructor === ResourceBase) {
      throw new AbstractClassError();
    }

    this.api = api;

    // De-reference
    data = { ...data };

    // Normalize keys to snake_case
    // Fix data types
    for (const key of Object.keys(data)) {
      const newKey = snakeCase(key);

      if (camelCase(newKey) in this) {
        delete data[key];

        continue;
      }

      data[newKey] = this.constructor._guessType(newKey, data[key]);

      if (newKey !== key) {
        delete data[key];
      }
    }

    this._baseProperties = data || {};
    this._properties = {};
    this._api = api;

    const fields = Object.keys(this._baseProperties);

    // Apply properties
    for (const key of fields) {
      this._applyProperty(key);
    }

    // Add deleted field if possible
    if (fields.includes('deleted_at')) {
      Object.defineProperty(this, 'deleted', {
        enumerable: true,
        configurable: true,

        get: () => Boolean(this.deletedAt),
      });
    }

    /* We keep track of any new fields by recording the
     * keys the object currently has. We don't need no
     * fancy-pants observers, Proxies etc.
     * snake_case only
     */
    this._knownFields = Object.keys(this).filter(x => x[0] !== '_');
  }

  /**
   * Get api instance
   * @returns {Mapcreator} - Api instance
   */
  get api () {
    return this._api;
  }

  /**
   * Set the api instance
   * @param {Mapcreator} value - Api instance
   */
  set api (value) {
    if (!isParentOf(Mapcreator, value)) {
      throw new TypeError('Expected api to be of type Mapcreator or null');
    }

    this._api = value;
  }

  /**
   * Resource path template
   * @returns {String} - Path template
   */
  static get resourcePath () {
    return `/${this.resourceName}/{id}`;
  }

  /**
   * Resource name
   * @returns {String} - Resource name
   * @abstract
   */
  static get resourceName () {
    throw new AbstractError();
  }

  /**
   * Returns the url key of the resource
   * @returns {String} - Resource key
   */
  static get resourceUrlKey () {
    return 'id';
  }

  /**
   * Protected read-only fields
   * @returns {Array<string>} - Array containing protected read-only fields
   * @protected
   */
  static get protectedFields () {
    return ['id', 'created_at', 'updated_at', 'deleted_at'];
  }

  /**
   * Returns if the resource is readonly
   * @returns {boolean} - readonly
   */
  static get readonly () {
    return false;
  }

  /**
   * Moves new fields to this._properties and turns them into a getter/setter
   * @protected
   */
  _updateProperties () {
    // Build a list of new fields
    let fields = Object.keys(this)
      .filter(x => x[0] !== '_')
      .filter(x => !this._knownFields.includes(x));

    // Move the pointer from this to the properties object
    for (const key of fields) {
      const newKey = snakeCase(key);

      this._properties[newKey] = this[key];
      delete this[key];

      this._applyProperty(newKey);
      this._knownFields.push(newKey);
    }

    // Build a list of new BaseProperty fields
    fields = Object.keys(this._baseProperties)
      .filter(x => !this._knownFields.includes(camelCase(x)));

    for (const key of fields) {
      this._applyProperty(key);
      this._knownFields.push(key);
    }

    this._knownFields = unique(this._knownFields);
  }

  /**
   * Clean up instance and commit all changes locally.
   * This means that any changed fields will be marked
   * as unchanged whilst  keeping their new values. The
   * changes will not be saved.
   */
  sanitize () {
    this._updateProperties();
    Object.assign(this._baseProperties, this._properties);
    this._properties = {};
  }

  /**
   * Resets model instance to it's original state
   * @param {Array<string>|string|null} [fields=null] - Fields to reset, defaults to all fields
   */
  reset (fields = null) {
    this._updateProperties();

    if (typeof fields === 'string') {
      this.reset([fields]);
    } else if (fields === null) {
      this._properties = {}; // Delete all
    } else if (Array.isArray(fields)) {
      fields
        .map(String)
        .map(snakeCase)
        .forEach(field => delete this._properties[field]);
    }
  }

  /**
   * Clone the object
   * @returns {ResourceBase} - Exact clone of the object
   */
  clone () {
    this._updateProperties();

    const out = new this.constructor(this.api, this._baseProperties);

    for (const key of Object.keys(this._properties)) {
      out[key] = this._properties[key];
    }

    return out;
  }

  /**
   * Refresh the resource by requesting it from the server again
   * @param {Boolean} updateSelf - Update the current instance
   * @returns {CancelablePromise<ResourceBase>} - Refreshed instance
   * @throws {ApiError}
   */
  refresh (updateSelf = true) {
    return makeCancelable(async signal => {
      const { data } = await this.api.ky.get(this.url, { signal }).json();

      if (updateSelf) {
        this._properties = {};
        this._baseProperties = data;

        this._updateProperties();
      }

      return new this.constructor(this._api, data);
    });
  }

  /**
   * Create proxy for property
   * @param {string} key - property key
   * @private
   */
  _applyProperty (key) {
    const desc = {
      enumerable: true,
      configurable: true,

      get: () => {
        if (this._properties.hasOwnProperty(key)) {
          return this._properties[key];
        }

        return this._baseProperties[key];
      },
    };

    if (!this.constructor.protectedFields.includes(key) && !this.constructor.readonly) {
      desc.set = val => {
        this._properties[key] = ResourceBase._guessType(key, val);
        delete this._url; // Clears url cache
      };
    }

    const newKey = camelCase(key);

    Object.defineProperty(this, newKey, desc);
  }

  /**
   * Guess type based on property name
   * @param {string} name - Field name
   * @param {*} value - Field Value
   * @private
   * @returns {*} - Original or converted value
   */
  static _guessType (name, value) {
    const regexp = /(?:^|_)([^_$]+)$/g;
    const match = regexp.exec(name);
    const idMacros = ['last', 'me', 'mine'];

    if (match === null || typeof value !== 'string') {
      return value;
    }

    switch (match[1]) {
      case 'end':
      case 'start':
      case 'at':
        return new Date(value.replace(' ', 'T'));
      case 'id':
        // Test if the value is in fact a macro
        if (idMacros.includes(String(value).toLowerCase())) {
          return value;
        }

        return Number(value);
      default:
        return value;
    }
  }

  /**
   * If the resource can be owned by an organisation
   * @returns {boolean} - Can be owned by an organisation
   */
  get ownable () {
    return false;
  }

  /**
   * Auto generated resource url
   * @returns {string} - Resource url
   */
  get url () {
    if (!this._url) {
      let url = `${this._api.host}/${this._api.version}${this.constructor.resourcePath}`;

      // Find and replace any keys
      url = url.replace(/{(\w+)}/g, (match, key) => this[camelCase(key)]);

      this._url = url;
    }

    return this._url;
  }

  /**
   * Auto generated Resource base url
   * @returns {string} - Resource base url
   */
  get baseUrl () {
    const basePath = this.constructor.resourcePath.match(/^(\/[^{]+\b)/)[1];

    return `${this._api.host}/${this._api.version}${basePath}`;
  }

  /**
   * List fields that contain object data
   * @returns {Array<String>} - A list of fields
   */
  get fieldNames () {
    const keys = unique([
      ...Object.keys(this._baseProperties),
      ...Object.keys(this._properties),
    ]);

    return keys.map(camelCase);
  }

  /**
   * String representation of the resource, similar to Python's __repr__
   * @returns {string} - Resource name and id
   */
  toString () {
    return `${this.constructor.name}(${this[this.resourceUrlKey]})`;
  }

  /**
   * Transform instance to object
   * @param {boolean} [camelCaseKeys=false] - camelCase object keys
   * @returns {{}} - object
   */
  toObject (camelCaseKeys = false) {
    this._updateProperties();

    const out = { ...this._baseProperties, ...this._properties };

    if (camelCaseKeys) {
      for (const key of Object.keys(out)) {
        const ccKey = camelCase(key);

        if (key !== ccKey) {
          out[ccKey] = out[key];

          delete out[key];
        }
      }
    }

    return out;
  }

  /**
   * Macro for resource listing
   * @param {string|function} Target - Target object
   * @param {?String} url - Target url, if null it will guess
   * @param {object} seedData - Internal use, used for seeding SimpleResourceProxy::new
   * @returns {SimpleResourceProxy} - A proxy for accessing the resource
   * @protected
   */
  _proxyResourceList (Target, url = null, seedData = {}) {
    if (!url) {
      url = `${Target.resourceName.replace(/s+$/, '')}s`;
    }

    if (typeof url === 'string' && !url.startsWith('/') && !url.match(/https?:/)) {
      url = `${this.url}/${url}`;
    }

    return new SimpleResourceProxy(this.api, Target, url, seedData);
  }

  /**
   * Static proxy generation
   * @param {string|function} Target - Constructor or url
   * @param {function?} Constructor - Constructor for a resource that the results should be cast to
   * @param {Object<string, *>} seedData - Optional data to seed the resolved resources
   * @returns {SimpleResourceProxy} - A proxy for accessing the resource
   * @example
   * user.static('jobs').lister();
   *
   * @example
   * class FooBar extends ResourceBase {
   *    static get resourceName() {
   *      return 'custom';
   *    }
   * }
   *
   * api.static(FooBar)
   *   .get(1)
   *   .then(console.log);
   */
  static (Target, Constructor = ResourceBase, seedData = {}) {
    let url;

    if (typeof Target === 'string') {
      url = `${this.url}/${Target}`;

      const name = Constructor.name || 'AnonymousResource';

      Target = class AnonymousResource extends Constructor {
        static get resourceName () {
          return Object.getPrototypeOf(this).resourceName || 'anonymous';
        }

        static get resourcePath () {
          return url;
        }
      };

      Object.defineProperty(Target, 'name', {
        value: `${name}_${fnv32b(url)}`,
      });
    }

    if (!isParentOf(ResourceBase, Target)) {
      throw new TypeError('Expected Target to be of type String or ResourceBase constructor');
    }

    return this._proxyResourceList(Target, url, seedData);
  }
}
