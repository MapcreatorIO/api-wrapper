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

import SimpleResourceProxy from './SimpleResourceProxy';

export default class OrganisationProxy extends SimpleResourceProxy {
  /**
   * @param {Maps4News} api - Instance of the api
   * @param {ResourceBase} parent - parent instance
   */
  constructor(api, parent) {
    // Fixes dependency issue
    const Organisation = require('../resources/Organisation').default;

    super(api, Organisation, `${parent.url}/organisations`, {});

    this._parent = parent;
  }

  /**
   * Returns parent instance
   * @returns {ResourceBase} - parent instance
   */
  get parent() {
    return this._parent;
  }

  /**
   * Sync organisations to the parent resource
   * The organisations attached to the target resource will be replaced with the organisations provided in the request.
   * @param {Array<Organisation|number>} organisations - List of items to sync
   * @returns {Promise} - Promise will resolve with no value and reject with an {@link ApiError} instance.
   */
  sync(organisations) {
    return this.parent._modifyLink(organisations, 'PATCH', this.Target);
  }

  /**
   * Attach organisations to the parent resource
   * The provided organisations will be attached to the resource if they're not already attached
   * @param {Array<Organisation|number>} organisations - List of items to attach
   * @returns {Promise} - Promise will resolve with no value and reject with an {@link ApiError} instance.
   */
  attach(organisations) {
    return this.parent._modifyLink(organisations, 'POST', this.Target);
  }

  /**
   * Detach organisations from the parent resource
   * The provided organisations will be detached from the resource
   * @param {Array<Organisation|number>} organisations - List of items to detach
   * @returns {Promise} - Promise will resolve with no value and reject with an {@link ApiError} instance.
   */
  detach(organisations) {
    return this.parent._modifyLink(organisations, 'DELETE', this.Target);
  }

  /**
   * Attach all organisations to the parent resource
   * @returns {Promise} - Promise will resolve with no value and reject with an {@link ApiError} instance.
   */
  attachAll() {
    const url = this._baseUrl + '/all';

    return this.api.request(url, 'POST');
  }

  /**
   * Detach all organisations from the parent resource
   * @returns {Promise} - Promise will resolve with no value and reject with an {@link ApiError} instance.
   */
  detachAll() {
    const url = this._baseUrl + '/all';

    return this.api.request(url, 'DELETE');
  }
}
