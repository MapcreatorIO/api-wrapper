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

import Maps4News from './Maps4News';
import ResourceBase from './resources/base/ResourceBase';
import {isNode} from './utils/node';
import {isParentOf} from './utils/reflection';
import {FormData} from './utils/requests';

/**
 * Image resource handler
 * @protected
 */
export default class ImageHandler {
  /**
   * @param {Maps4News} api - Api instance
   * @param {ResourceBase} target - Instance of target item
   */
  constructor(api, target) {
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
  get api() {
    return this._api;
  }

  /**
   * Resource url, can be used in an image tag
   * @returns {string} - Resource url
   */
  get url() {
    return `${this._target.url}/image`;
  }

  /**
   * Delete image
   * @returns {Promise} - Resolves with an empty {@link Object} and rejects with {@link ApiError}
   */
  delete() {
    return this._api.request(this.url, 'DELETE');
  }

  /**
   * Get image base64 representation
   * @returns {Promise} - Resolves with a {@link String} containing a blob reference to the image and rejects with {@link ApiError}
   * @example
   * // Browser
   * layer.imageHandler.download().then(url => {
   *   $('img').src = url;
   * });
   *
   * // NodeJs
   * layer.imageHandler.download().then(buffer => {
   *   fs.open(path, 'w', function(err, fd) {
   *     if (err) {
   *         throw 'could not open file: ' + err;
   *     }
   *
   *     // write the contents of the buffer, from position 0 to the end, to the file descriptor returned in opening our file
   *     fs.write(fd, buffer, 0, buffer.length, null, function(err) {
   *       if (err) throw 'error writing file: ' + err;
   *       fs.close(fd, function() {
   *         console.log('wrote the file successfully');
   *       });
   *     });
   *   });
   * });
   */
  async download() {
    const data = await this.api.request(`${this.url}`);

    if (isNode()) {
      return data;
    }

    return (window.URL || window.webkitURL).createObjectURL(data);
  }

  /**
   * Upload new image
   * @param {File|Buffer} image - Image file
   * @returns {Promise} - Resolves with an empty {@link Object} and rejects with {@link ApiError}
   */
  upload(image) {
    const Type = isNode() ? Buffer : File;

    if (!isParentOf(Type, image)) {
      throw new TypeError('Expected image to be of type File');
    }

    const formData = new FormData();

    formData.append('image', image);

    return this.api.request(this.url, 'POST', formData);
  }
}
