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

import { encodeQueryString } from '../utils/requests';
import SimpleResourceProxy from './SimpleResourceProxy';
import { makeCancelable } from '../utils/helpers';

/**
 * Proxy for accessing resource. This will make sure that they
 * are properly wrapped before the promise resolves.
 * @protected
 */
export default class ResourceProxy extends SimpleResourceProxy {
  /**
   * Parse selector
   * @param {Number|String|Object} [id=] - The resource id to be requested
   * @returns {Object} - Parsed selector
   * @private
   */
  _parseSelector (id) {
    if (id === '' || id === null) {
      return {};
    }

    switch (typeof id) {
      case 'number':
      case 'string':
        return { [this.Target.resourceUrlKey]: id };
      case 'object':
        return id;
      default:
        return {};
    }
  }

  /**
   * Get target resource
   * @param {Number|String|Object} [id=] - The resource id to be requested
   * @param {String} [deleted=null] - Determines if the resource should be shown if deleted, requires special resource permissions. Possible values: only, none, all
   * @returns {CancelablePromise<ResourceBase>} - Target resource
   * @throws {ApiError} - If the api returns errors
   */
  get (id, deleted = null) {
    return makeCancelable(async signal => {
      const data = { ...this._seedData, ...this._parseSelector(id) };
      let url = this.new(data).url;

      if (typeof deleted === 'string') {
        const glue = url.includes('?') ? '&' : '?';

        url += glue + encodeQueryString({ deleted });
      }

      const { data: result } = await this.api.ky.get(url, { signal }).json();

      return this.new(result);
    });
  }

  /**
   * Select target resource without obtaining data
   * @param {Number|String} [id=] - Resource id
   * @returns {ResourceBase} - Empty target resource
   * @example
   * api.users.select('me').colors().then(doSomethingCool);
   */
  select (id) {
    const data = { ...this._seedData, ...this._parseSelector(id) };

    return this.new(data);
  }
}
