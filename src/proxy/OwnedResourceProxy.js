/*
 * BSD 3-Clause License
 *
 * Copyright (c) 2018, MapCreator
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

import SimpleResourceProxy from './SimpleResourceProxy';

/**
 * Used for proxying resource => organisation
 */
export default class OwnedResourceProxy extends SimpleResourceProxy {
  /**
   * OwnedResourceProxy Constructor
   * @param {Maps4News} api - api instance
   * @param {ResourceBase} parent - parent instance
   * @param {constructor} Target - target constructor
   */
  constructor(api, parent, Target) {
    const resource = Target.resourceName.replace(/s+$/, '');
    const url = `${parent.url}/${resource}s`;

    super(api, Target, url);
  }

  /**
   * Sync items to the organisation
   * @param {Array<ResourceBase>|Array<number>|ResourceBase|number} items - List of items to sync
   * @throws {TypeError}
   * @throws {ApiError}
   */
  async sync(items) {
    await this._modifyResourceLink(items, 'PATCH');
  }

  /**
   * Attach items to the organisation
   * @param {Array<ResourceBase>|Array<number>|ResourceBase|number} items - List of items to attach
   * @throws {TypeError}
   * @throws {ApiError}
   */
  async attach(items) {
    await this._modifyResourceLink(items, 'POST');
  }

  /**
   * Detach items from the organisation
   * @param {Array<ResourceBase>|Array<number>|ResourceBase|number} items - List of items to unlink
   * @throws {TypeError}
   * @throws {ApiError}
   */
  async detach(items) {
    await this._modifyResourceLink(items, 'DELETE');
  }

  /**
   * Attach parent resource to all organisations
   * @throws {ApiError}
   */
  async attachAll() {
    await this.api.axios.post(`${this.baseUrl}/all`);
  }

  /**
   * Detach parent resource to all organisations
   * @throws {ApiError}
   */
  async detachAll() {
    await this.api.axios.delete(`${this.baseUrl}/all`);
  }

  /**
   * @param {Array<ResourceBase>|Array<number>|ResourceBase|number} items - List of items to sync, attach or detach
   * @param {string} method - http method
   * @throws {ApiError}
   * @throws {TypeError}
   * @private
   */
  async _modifyResourceLink(items, method) {
    if (!(items instanceof Array)) {
      items = [items];
    }

    const keys = items
      .map(x => typeof x === 'object' && x.id ? x.id : x)
      .map(Number)
      .filter(x => !Number.isNaN(x));

    if (!keys.length === 0) {
      throw new TypeError('Expected items to be of type Array<ResourceBase>, Array<number>, ResourceBase or number}');
    }

    await this.api.axios.request({
      url: this.baseUrl,
      method,
      data: {keys},
    });
  }
}
