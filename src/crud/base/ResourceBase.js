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

import {AbstractClassError, AbstractError} from '../../exceptions/AbstractError';
import Maps4News from '../../Maps4News';
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
    Object.keys(data).map(key => {
      const newKey = camelToSnakeCase(pascalToCamelCase(key));

      if (newKey !== key) {
        data[newKey] = ResourceBase._guessType(newKey, data[key]);
        delete data[key];
      } else {
        data[key] = ResourceBase._guessType(newKey, data[key]);
      }
    });

    this._baseProperties = data;
    this._properties = {};
    this._api = api;

    this._applyProperties();
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
   * Creates proxies for the properties
   * @returns {void}
   * @private
   */
  _applyProperties() {
    const protectedFields = ['id', 'created_at', 'updated_at', 'deleted_at'];
    const fields = Object.keys(this._baseProperties);

    for (const key of fields) {
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

      if (!protectedFields.includes(key)) {
        desc.set = (val) => {
          this._properties[key] = ResourceBase._guessType(key, val);
          delete this._url; // Clears url cache
        };
      }

      Object.defineProperty(this, snakeToCamelCase(key), desc);
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
    const idMacros = ['last', 'me'];

    if (match === null || typeof value !== 'string') {
      return value;
    }

    switch (match[1]) {
      case 'end':
      case 'start':
      case 'at':
        return new Date(value);
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

      for (const key of Object.keys(this._baseProperties)) {
        url = url.replace(`{${key}}`, this[key]);
      }

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
}
