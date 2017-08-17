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

import {AbstractClassError, AbstractError} from '../../errors/AbstractError';
import Maps4News from '../../Maps4News';
import SimpleResourceProxy from '../../SimpleResourceProxy';
import {camelToSnakeCase, pascalToCamelCase, snakeToCamelCase} from '../../utils/caseConverter';
import {isParentOf} from '../../utils/reflection';

/**
 * Resource base
 * @abstract
 */
export default class ResourceBase {
  /**
   * @param {Maps4News} api - Api instance
   * @param {Object<String, *>} data - Item data
   */
  constructor(api, data = {}) {
    if (this.constructor === ResourceBase) {
      throw new AbstractClassError();
    }

    if (!isParentOf(Maps4News, api)) {
      throw new TypeError('Expected api to be of type Maps4News');
    }

    // Normalize keys to snake_case
    // Fix data types
    for (const key of Object.keys(data)) {
      const newKey = camelToSnakeCase(pascalToCamelCase(key));

      data[newKey] = ResourceBase._guessType(newKey, data[key]);

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

        get: () => {
          return Boolean(this.deletedAt);
        },
      });
    }

    /* We keep track of any new fields by recording the
     * keys the object currently has. We don't need no
     * fancy-pants observers, Proxies etc.
     */
    this._knownFields = Object.keys(this).filter(x => x[0] !== '_');
  }

  /**
   * Get api instance
   * @returns {Maps4News} - Api instance
   */
  get api() {
    return this._api;
  }

  /**
   * Resource path template
   * @returns {String} - Path template
   */
  get resourcePath() {
    return `/${this.resourceName}/{id}`;
  }

  /**
   * Resource name
   * @returns {String} - Resource name
   * @abstract
   */
  get resourceName() {
    throw new AbstractError();
  }

  /**
   * Protected read-only fields
   * @returns {Array<string>} - Array containing the protected fields
   * @protected
   */
  get _protectedFields() {
    return ['id', 'created_at', 'updated_at', 'deleted_at'];
  }

  /**
   * Moves new fields to this._properties and turns them into a getter/setter
   * @returns {void}
   * @protected
   */
  _updateProperties() {
    // Build a list of new fields
    const fields = Object.keys(this)
      .filter(x => x[0] !== '_')
      .filter(x => !this._knownFields.includes(x));

    // Move the pointer from this to the properties object
    for (const key of fields) {
      const newKey = camelToSnakeCase(key);

      this._properties[newKey] = this[key];
      delete this[key];

      this._knownFields.push(key);

      this._applyProperty(newKey);
    }
  }

  /**
   * Refresh the resource by requesting it from the server again
   * @param {Boolean} updateSelf - Update the current instance
   * @returns {Promise} - Resolves with {@link ResourceBase} instance and rejects with {@link ApiError}
   */
  refresh(updateSelf = true) {
    return new Promise((resolve, reject) => {
      this._api.request(this.url)
        .catch(reject)
        .then(data => {
          if (updateSelf) {
            this._properties = {};
            this._baseProperties = data;
          }

          resolve(new this(this._api, data));
        });
    });
  }

  /**
   * Create proxy for property
   * @param {string} key - property key
   * @returns {void}
   * @private
   */
  _applyProperty(key) {
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

    if (!this._protectedFields.includes(key)) {
      desc.set = (val) => {
        this._properties[key] = ResourceBase._guessType(key, val);
        delete this._url; // Clears url cache
      };
    }

    Object.defineProperty(this, snakeToCamelCase(key), desc);
  }

  /**
   * Guess type based on property name
   * @param {string} name - Field name
   * @param {*} value - Field Value
   * @private
   * @returns {*} - Original or converted value
   * @todo find a reasonable way to cast boolean types
   */
  static _guessType(name, value) {
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
  get ownable() {
    return false;
  }

  /**
   * Auto generated resource url
   * @returns {string} - Resource url
   */
  get url() {
    if (!this._url) {
      let url = `${this._api.host}/${this._api.version}${this.resourcePath}`;

      // Find and replace any keys
      url = url.replace(/{(\w+)}/g, (match, key) => this[snakeToCamelCase(key)]);

      this._url = url;
    }

    return this._url;
  }

  /**
   * Auto generated Resource base url
   * @returns {string} - Resource base url
   */
  get baseUrl() {
    const basePath = this.resourcePath.match(/^(\/[^{]+\b)/)[1];

    return `${this._api.host}/${this._api.version}${basePath}`;
  }

  /**
   * List fields that contain object data
   * @returns {Array<String>} - A list of fields
   */
  get fieldNames() {
    return Object
      .keys(this._baseProperties)
      .map(snakeToCamelCase);
  }

  /**
   * String representation of the resource, similar to Python's __repr__
   * @returns {string} - Resource name and id
   */
  toString() {
    return `${this.constructor.name}(${this.id})`;
  }

  /**
   * Macro for resource listing
   * @param {ResourceBase} Target - Target object
   * @param {?String} url - Target url, if null it will guess
   * @param {object} seedData - Internal use, used for seeding SimpleResourceProxy::new
   * @returns {SimpleResourceProxy} - A proxy for accessing the resource
   * @protected
   */
  _proxyResourceList(Target, url = null, seedData = {}) {
    if (!url) {
      const resource = (new Target(this.api)).resourceName.replace(/s+$/, '');

      url = `${this.url}/${resource}s`;
    }

    return new SimpleResourceProxy(this.api, Target, url, seedData);
  }
}
