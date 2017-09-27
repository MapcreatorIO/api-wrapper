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
import {getTypeName} from './utils/reflection';
import {encodeQueryString} from './utils/requests';

export default class RequestParameters {
  constructor(object = {}) {
    // Apply properties
    for (const key of Object.keys(object)) {
      if (key[0] === '_' || !(key in this)) {
        continue;
      }

      if (typeof this[key] === 'function') {
        continue;
      }

      // Weird syntax used here is to confuse esdoc
      (this || {})[key] = object[key];
    }

    // Apply defaults
    RequestParameters.keys().forEach(x => this._resolve(x));
  }

  // region instance
  // region instance getters
  get page() {
    return this._resolve('page');
  }

  get perPage() {
    return this._resolve('perPage');
  }

  get search() {
    return this._resolve('search');
  }

  get sort() {
    return this._resolve('sort');
  }

  get deleted() {
    return this._resolve('deleted');
  }

  // endregion instance getters

  // region instance setters
  set page(value) {
    this._page = RequestParameters._validatePage(value);
  }

  set perPage(value) {
    this._perPage = RequestParameters._validatePerPage(value);
  }

  set search(value) {
    this._search = RequestParameters._validateSearch(value);
  }

  set sort(value) {
    this._sort = RequestParameters._validateSort(value);
  }

  set deleted(value) {
    this._deleted = RequestParameters._validateDeleted(value);
  }

  // endregion instance setters
  // endregion instance

  // region static
  // region getters
  static get page() {
    return RequestParameters._page || 1;
  }

  static get perPage() {
    return RequestParameters._perPage || Number(process.env.PER_PAGE);
  }

  static get search() {
    return RequestParameters._search || {};
  }

  static get sort() {
    return RequestParameters._sort || [];
  }

  static get deleted() {
    return RequestParameters._deleted || process.env.SHOW_DELETED.toLowerCase();
  }

  // endregion getters

  // region setters
  static set page(value) {
    RequestParameters._page = RequestParameters._validatePage(value);
  }

  static set perPage(value) {
    RequestParameters._perPage = RequestParameters._validatePerPage(value);
  }

  static set search(value) {
    RequestParameters._search = RequestParameters._validateSearch(value);
  }

  static set sort(value) {
    RequestParameters._sort = RequestParameters._validateSort(value);
  }

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
    // @todo Disabled for now due to the fact that I have to rewrite a lot of code for this to work
    return value;

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
  }

  // endregion validators

  _resolve(name) {
    const _name = '_' + name;

    if (!this[_name]) {
      this[_name] = RequestParameters[name];
    }

    return this[_name];
  }

  encode() {
    const data = this.toObject();

    // @todo ensure that the type is always the same
    if (Array.isArray(data.sort)) {
      data.sort = data.sort.join(',');
    }

    return encodeQueryString(data);
  }

  toObject() {
    const data = {};

    RequestParameters
      .keys()
      .forEach(key => {
        data[key] = this._resolve(key);
      });

    return data;
  }

  copy() {
    const data = {};

    RequestParameters
      .keys()
      .forEach(key => {
        data[key] = this._resolve(key);
      });

    return new RequestParameters(data);
  }

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
}
