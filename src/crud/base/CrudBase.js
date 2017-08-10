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

import {AbstractClassError} from '../../errors/AbstractError';
import PaginatedResourceListing from '../../PaginatedResourceListing';
import ResourceBase from './ResourceBase';
import {paginateResource} from '../../utils/helpers';

/**
 * Base of all resource items that support Crud operations
 * @abstract
 */
export default class CrudBase extends ResourceBase {
  /**
   * @param {Maps4News} api - Api instance
   * @param {Object<String, *>} data - Item data
   */
  constructor(api, data = {}) {
    super(api, data);

    if (this.constructor === CrudBase) {
      throw new AbstractClassError();
    }
  }

  /**
   * Build data for create operation
   * @returns {Object<String, *>} - Create data
   * @protected
   */
  _buildCreateData() {
    const out = {};
    const keys = [].concat(
      Object.keys(this._properties),
      Object.keys(this._baseProperties),
    ).filter((item, pos, self) => self.indexOf(item) === pos);

    for (const key of keys) {
      out[key] = this._properties[key] || this._baseProperties[key];
    }

    delete out.id;
    return out;
  }

  /**
   * Macro for resource listing
   * @param {ResourceBase} Target - Target object
   * @param {String} url - Target url, if not set it will guess
   * @param {Number} page - Page number
   * @param {Number} perPage - Amount of items per page
   * @returns {Promise} - Resolves with {@link PaginatedResourceListing} instance and rejects with {@link ApiError}
   * @protected
   */
  _listResource(Target, url = null, page = 1, perPage = this.api.defaults.perPage) {
    return paginateResource(this.api, url, page, perPage, Target);
  }

  /**
   * Save item. This will create a new item if `id` is unset
   * @returns {Promise} - Resolves with {@link CrudBase} instance and rejects with {@link ApiError}
   */
  save() {
    return !this.id ? this._create() : this._update();
  }

  /**
   * Store new item
   * @returns {Promise} - Resolves with {@link CrudBase} instance and rejects with {@link ApiError}
   * @private
   */
  _create() {
    return new Promise((resolve, reject) => {
      this.api
        .request(this.baseUrl, 'POST', this._buildCreateData())
        .catch(reject)
        .then(data => {
          this._properties = {};
          this._baseProperties = data;

          resolve(this);
        });
    });
  }

  /**
   * Update existing item
   * @returns {Promise} - Resolves with {@link CrudBase} instance and rejects with {@link ApiError}
   * @private
   */
  _update() {
    return new Promise((resolve, reject) => {
      this.api
        .request(this.url, 'PATCH', this._properties)
        .catch(reject)
        .then(() => resolve(this));
    });
  }

  /**
   * Delete item
   * @returns {Promise} - Resolves with an empty {@link Object} and rejects with {@link ApiError}
   */
  delete() {
    return this.api.request(this.url, 'DELETE');
  }

  /**
   * Restore item
   * @returns {Promise} - Resolves with {@link CrudBase} instance and rejects with {@link ApiError}
   */
  restore() {
    return new Promise((resolve, reject) => {
      this.api.request(this.url, 'PUT')
        .catch(reject)
        .then(data => resolve(new this(this.api, data)));
    });
  }
}
