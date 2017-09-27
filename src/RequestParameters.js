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


import DeletedState from './enums/DeletedState';
import {camelToPascalCase, camelToSnakeCase, snakeToCamelCase} from './utils/caseConverter';
import {getTypeName} from './utils/reflection';
import {encodeQueryString} from './utils/requests';
import {fnv32a, hashObject} from './utils/hash';

/**
 * Used for keeping track of the request parameters
 */
export default class RequestParameters {
  /**
   * RequestParameters constructor
   * @param {Object} object - properties
   */
  constructor(object = {}) {
    this._watch = [];

    // Apply defaults
    RequestParameters.keys().forEach(x => this._resolve(x));

    // Apply properties
    for (const key of Object.keys(object)) {
      const Key = snakeToCamelCase(key);

      if (key[0] === '_' || !RequestParameters.keys().includes(Key)) {
        continue;
      }

      this._update(Key, object[key]);
    }
  }

  // region instance
  // region instance getters
  /**
   * Get page number
   * @returns {Number} - Page number
   * @throws TypeError
   */
  get page() {
    return this._resolve('page');
  }

  /**
   * Get rows per page
   * @returns {Number} - Per page
   * @throws TypeError
   */
  get perPage() {
    return this._resolve('perPage');
  }

  /**
   * Search query
   * @returns {Object<String, String|Array<String>>} - Query
   * @throws TypeError
   */
  get search() {
    return this._resolve('search');
  }

  /**
   * Get sort options
   * @returns {Array<String>} - Per page
   * @throws TypeError
   */
  get sort() {
    return this._resolve('sort');
  }

  /**
   * If deleted items should be shown
   * @returns {String} - Deleted items filter state
   * @see {@link DeletedState}
   */
  get deleted() {
    return this._resolve('deleted');
  }

  // endregion instance getters

  // region instance setters
  /**
   * Page number
   * @param {Number} value - Page number
   */
  set page(value) {
    this._update('page', value);
  }

  /**
   * Rows per page number
   * @param {Number} value - Per page
   */
  set perPage(value) {
    this._update('perPage', value);
  }

  /**
   * Search query
   * @param {Object<String, String|Array<String>>} value - Search query
   */
  set search(value) {
    this._update('search', value);
  }

  /**
   * Sort query
   * @param {Array<String>} value - Sort query
   */
  set sort(value) {
    this._update('sort', value);
  }

  /**
   * Deleted items filter state
   * @param {String} value - Deleted items filter state
   * @see {@link DeletedState}
   */
  set deleted(value) {
    this._update('deleted', value);
  }

  // endregion instance setters
  // endregion instance

  // region static
  // region getters
  /**
   * Default page number
   * @returns {Number} - Page number
   */
  static get page() {
    return RequestParameters._page || 1;
  }

  /**
   * Default per page
   * @returns {Number} - Per page
   */
  static get perPage() {
    return RequestParameters._perPage || Number(process.env.PER_PAGE);
  }

  /**
   * Default search query
   * @returns {Object<String, String|Array<String>>} - Search query
   */
  static get search() {
    return RequestParameters._search || {};
  }

  /**
   * Default sort query
   * @returns {Array<String>} - Sort query
   */
  static get sort() {
    return RequestParameters._sort || [];
  }

  /**
   * Default deleted items filter state
   * @returns {String} -  Deleted items filter state
   */
  static get deleted() {
    return RequestParameters._deleted || process.env.SHOW_DELETED.toLowerCase();
  }

  // endregion getters

  // region setters
  /**
   * Default page number
   * @param {Number} value - Page number
   */
  static set page(value) {
    RequestParameters._page = RequestParameters._validatePage(value);
  }

  /**
   * Default per page
   * @param {Number} value - Per page
   */
  static set perPage(value) {
    RequestParameters._perPage = RequestParameters._validatePerPage(value);
  }

  /**
   * Default search query
   * @param {Object<String, String|Array<String>>} value - Search query
   */
  static set search(value) {
    RequestParameters._search = RequestParameters._validateSearch(value);
  }

  /**
   * Default sort query
   * @param {Array<String>} value - Sort query
   */
  static set sort(value) {
    RequestParameters._sort = RequestParameters._validateSort(value);
  }

  /**
   * Default deleted items filter state
   * @param {String} value -  Deleted items filter state
   */
  static set deleted(value) {
    RequestParameters._deleted = RequestParameters._validateDeleted(value);
  }

  // endregion setters
  // endregion static

  // region validators
  /**
   * Validators should work the same as laravel's ::validate method. This means
   * this means that they will throw a TypeError or return a normalized result.
   */

  static _validatePage(value) {
    if (typeof value !== 'number') {
      throw new TypeError(`Expected page to be of type 'number' instead got '${typeof value}'`);
    }

    return Math.round(value);
  }

  static _validatePerPage(value) {
    if (typeof value !== 'number') {
      throw new TypeError(`Expected page to be of type 'Number' instead got '${getTypeName(value)}'`);
    }

    value = Math.round(value);
    value = Math.min(50, value); // Upper limit is 50
    value = Math.max(1, value); // Lower limit is 1

    return value;
  }

  static _validateSearch(value) {
    if (typeof value !== 'object') {
      throw new TypeError(`Expected value to be of type "Object" got "${getTypeName(value)}"`);
    }

    for (const key of Object.keys(value)) {
      if (typeof key !== 'string') {
        throw new TypeError(`Expected key to be of type "String" got "${getTypeName(key)}"`);
      }

      if (Array.isArray(value[key])) {
        if (value[key].length > 0) {
          for (const query of value[key]) {
            if (typeof query !== 'string') {
              throw new TypeError(`Expected query for "${key}" to be of type "String" got "${getTypeName(query)}"`);
            }
          }
        } else {
          // Drop empty nodes
          delete value[key];
        }
      } else if (value[key] === null) {
        delete value[key];
      } else if (typeof value[key] !== 'string') {
        throw new TypeError(`Expected query value to be of type "String" or "Array" got "${getTypeName(key)}"`);
      }
    }

    return value;
  }

  static _validateSort(value) {
    if (!(value instanceof Array)) {
      throw new TypeError(`Expected sort value to be of type "Array" got "${getTypeName(value)}"`);
    }

    // Array keys type checking
    value
      .filter(x => typeof x !== 'string')
      .forEach(x => {
        throw new TypeError(`Expected sort array values to be of type "String" got "${getTypeName(x)}"`);
      });

    // Don't do regex matching because it's something
    // we can just let the server do for us.

    return value;
  }

  static _validateDeleted(value) {
    value = value.toLowerCase();

    const possible = DeletedState.values();

    if (!possible.includes(value)) {
      throw new TypeError(`Expected deleted to be on of ${possible.join(', ')}`);
    }

    return value;
  }

  // endregion validators

  _resolve(name) {
    const _name = '_' + name;

    if (!this[_name]) {
      // Confuse esdoc
      (this || {})[_name] = RequestParameters[name];
    }

    return this[_name];
  }

  _update(name, value) {
    const _name = '_' + name;

    value = RequestParameters['_validate' + camelToPascalCase(name)](value);
    (this || {})[_name] = value; // Weird syntax confuses esdoc

    this._watch.forEach(m => m(name, value));
  }

  // region utils
  /**
   * Urlencode parameters
   * @returns {string} - HTTP query
   */
  encode() {
    const data = this.toObject();

    if (Array.isArray(data.sort)) {
      data.sort = data.sort.join(',');
    }

    return encodeQueryString(data);
  }

  /**
   * Convert to object
   * @returns {Object} - Object
   */
  toObject() {
    const data = {};

    RequestParameters
      .keys()
      .forEach(key => {
        data[camelToSnakeCase(key)] = this._resolve(key);
      });

    return data;
  }

  /**
   * Copy object
   * @returns {RequestParameters} - Copy
   */
  copy() {
    return new RequestParameters(this.toObject());
  }

  /**
   * Different parameters
   * @returns {Array<String>} - keys
   */
  static keys() {
    // enumeration is disabled for properties
    return [
      'page',
      'perPage',
      'search',
      'sort',
      'deleted',
    ];
  }

  /**
   * Watch for changes
   * @param {Function} method - Callback method
   * @param {?String} [name=null] - Property name
   * @returns {void}
   */
  watch(method, name = null) {
    if (name) {
      method = (n, v) => {
        if (n === name.toLowerCase()) {
          method(v);
        }
      };
    }

    this._watch.push(method);
  }

  token() {
    return hashObject(this.toObject());
  }
  // endregion utils
}
