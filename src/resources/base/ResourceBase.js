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

import {camel as camelCase, snake as snakeCase} from 'case';
import {AbstractClassError, AbstractError} from '../../errors/AbstractError';
import Maps4News from '../../Maps4News';
import SimpleResourceProxy from '../../proxy/SimpleResourceProxy';
import {isParentOf} from '../../utils/reflection';

function unique(input) {
  return input.filter((v, i) => input.findIndex(vv => vv === v) === i);
}

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
      const newKey = snakeCase(key);

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

        get: () => {
          return Boolean(this.deletedAt);
        },
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
   * @returns {Maps4News} - Api instance
   */
  get api() {
    return this._api;
  }

  /**
   * Resource path template
   * @returns {String} - Path template
   * @todo move to constructor
   */
  get resourcePath() {
    return `/${this.resourceName}/{id}`;
  }

  /**
   * Resource name
   * @returns {String} - Resource name
   * @todo move to constructor
   * @abstract
   */
  get resourceName() {
    throw new AbstractError();
  }

  /**
   * Returns the url key of the resource
   * @returns {String} - Resource key
   */
  static get resourceUrlKey() {
    return 'id';
  }

  /**
   * Protected read-only fields
   * @returns {Array<string>} - Array containing the protected fields
   * @todo move to constructor
   * @protected
   */
  get _protectedFields() {
    return ['id', 'created_at', 'updated_at', 'deleted_at'];
  }

  /**
   * Returns if the resource is readonly
   * @returns {boolean} - readonly
   */
  static get readonly() {
    return false;
  }

  /**
   * Moves new fields to this._properties and turns them into a getter/setter
   * @returns {void}
   * @protected
   */
  _updateProperties() {
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
   * @returns {void}
   */
  sanitize() {
    this._updateProperties();
    Object.assign(this._baseProperties, this._properties);
    this._properties = {};
  }

  /**
   * Resets model instance to it's original state
   * @param {Array<string>|string|null} fields - Fields to reset, defaults to all fields
   * @returns {void}
   */
  reset(fields = null) {
    this._updateProperties();

    if (fields === null) {
      fields = this._knownFields;
    }

    if (!Array.isArray(fields)) {
      fields = [fields];
    }

    fields = Array.isArray(fields) ? fields : [fields];

    fields
      .map(String)
      .map(snakeCase)
      .forEach(field => delete this._properties[field]);
  }

  /**
   * Clone the object
   * @returns {ResourceBase} - Exact clone of the object
   */
  clone() {
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
   * @returns {Promise} - Resolves with {@link ResourceBase} instance and rejects with {@link ApiError}
   */
  refresh(updateSelf = true) {
    return this._api
      .request(this.url)
      .then(data => {
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

    if (!this._protectedFields.includes(key) && !this.constructor.readonly) {
      desc.set = (val) => {
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
      url = url.replace(/{(\w+)}/g, (match, key) => this[camelCase(key)]);

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
      .map(camelCase);
  }

  /**
   * String representation of the resource, similar to Python's __repr__
   * @returns {string} - Resource name and id
   */
  toString() {
    return `${this.constructor.name}(${this[this.resourceUrlKey]})`;
  }

  /**
   * Transform instance to object
   * @param {boolean} [camelCaseKeys=false] - camelCase object keys
   * @returns {{}} - object
   */
  toObject(camelCaseKeys = false) {
    this._updateProperties();

    const out = Object.assign({}, this._baseProperties, this._properties);

    if (camelCaseKeys) {
      for (const key in Object.keys(out)) {
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
