/*
 * BSD 3-Clause License
 *
 * Copyright (c) 2020, MapCreator
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

import Maps4News from './Maps4News';
import DownloadedResource from './resources/base/DownloadedResource';
import ResourceBase from './resources/base/ResourceBase';
import { isParentOf } from './utils/reflection';
import { FormData } from './utils/requests';

/**
 * Image resource handler
 * @protected
 */
export default class ImageHandler {
  /**
   * @param {Maps4News} api - Api instance
   * @param {ResourceBase} target - Instance of target item
   */
  constructor (api, target) {
    if (!isParentOf(Maps4News, api)) {
      throw new TypeError('Expected api to be of type Maps4News');
    }

    if (!isParentOf(ResourceBase, target)) {
      throw new TypeError('Expected target to be of type ResourceBase');
    }

    this._api = api;
    this._target = target;
  }

  /**
   * Get api instance
   * @returns {Maps4News} - Api instance
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
   * @throws {ApiError}
   */
  async delete () {
    await this.api.axios.delete(this.url);
  }

  /**
   * Download the image
   * @returns {Promise<DownloadedResource>} - image
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
  async download () {
    const response = await this.api.axios.get(this.url, {
      responseType: 'arraybuffer',
    });

    return DownloadedResource.fromAxiosResponse(response);
  }

  /**
   * Upload new image
   * @param {ArrayBuffer|ArrayBufferView|File|Blob|Buffer} image - Image file
   */
  async upload (image) {
    const form = new FormData();

    form.append('image', image, 'image');

    const headers = {};

    if (form.getHeaders) {
      Object.assign(headers, form.getHeaders());
    }

    await this.api.axios.post(this.url, form, { headers });
  }
}
