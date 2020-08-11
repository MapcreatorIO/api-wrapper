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

import Mapcreator from './Mapcreator';
import DownloadedResource from './resources/base/DownloadedResource';
import ResourceBase from './resources/base/ResourceBase';
import { isParentOf } from './utils/reflection';
import { FormData } from './utils/requests';
import { makeCancelable } from './utils/helpers';

/**
 * Image resource handler
 * @protected
 */
export default class ImageHandler {
  /**
   * @param {Mapcreator} api - Api instance
   * @param {ResourceBase} target - Instance of target item
   */
  constructor (api, target) {
    if (!isParentOf(Mapcreator, api)) {
      throw new TypeError('Expected api to be of type Mapcreator');
    }

    if (!isParentOf(ResourceBase, target)) {
      throw new TypeError('Expected target to be of type ResourceBase');
    }

    this._api = api;
    this._target = target;
  }

  /**
   * Get api instance
   * @returns {Mapcreator} - Api instance
   */
  get api () {
    return this._api;
  }

  /**
   * Resource url, can be used in an image tag
   * @returns {string} - Resource url
   */
  get url () {
    return `${this._target.url}/image`;
  }

  /**
   * Delete image
   * @throws {ApiError} - If the api returns errors
   * @returns {CancelablePromise}
   */
  delete () {
    // use the makeCancelable helper so we don't return the response object
    return makeCancelable(async signal => {
      await this.api.ky.delete(this.url, { signal });
    });
  }

  /**
   * Download the image
   * @returns {CancelablePromise<DownloadedResource>} - image
   * @throws {ApiError} - If the api returns errors
   * @example
   * // Browser
   * layer.imageHandler.download().then(image => {
   *   $('img').src = image.createObjectURL();
   * });
   *
   * // NodeJs
   * layer.imageHandler.download().then({fileName, data} => {
   *   fs.writeFileSync(fileName, data);
   * });
   */
  download () {
    return makeCancelable(async signal => {
      const response = await this.api.ky.get(this.url, { signal });

      return DownloadedResource.fromResponse(response);
    });
  }

  /**
   * Upload new image
   * @param {ArrayBuffer|ArrayBufferView|File|Blob|Buffer} image - Image file
   * @returns {CancelablePromise}
   * @throws {ApiError} - If the api returns errors
   */
  upload (image) {
    const body = new FormData();

    body.append('image', image, 'image');

    const headers = {};

    if (body.getHeaders) {
      Object.assign(headers, body.getHeaders());
    }

    return makeCancelable(async signal => {
      await this.api.ky.post(this.url, { headers, body, signal });
    });
  }
}
