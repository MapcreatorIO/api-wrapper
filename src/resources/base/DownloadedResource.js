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

import { base64Encode } from '../../utils/base64';
import { isNode } from '../../utils/node';

/**
 * Downloaded resource from the api
 */
export default class DownloadedResource {
  /**
   *
   * @param {ArrayBuffer|Buffer} data - data
   * @param {string} [type=application/octet-stream] - mime-type
   * @param {string} [fileName=Untitled] - file name
   */
  constructor (data, type = 'application/octet-stream', fileName = 'Untitled') {
    this._data = data;
    this._type = type;
    this._fileName = fileName;
  }

  /**
   * Build instance from Axios response
   * @param {AxiosResponse} axiosResponse - axios response
   * @returns {DownloadedResource} - instance
   */
  static fromAxiosResponse (axiosResponse) {
    const { data, headers } = axiosResponse;

    // Find mimeType
    let mimeType;
    const contentType = headers['content-type'];

    if (contentType) {
      mimeType = contentType.split(';')[0].trim();
    }

    // Extract file name
    let fileName;
    const contentDisposition = headers['content-disposition'];

    if (contentDisposition) {
      const regex = /filename[^;=\n]*=((['"])(.*?)\2|([^;\s]*))/i;
      const matches = regex.exec(contentDisposition);

      if (matches) {
        fileName = matches[3] || matches[4];
      }
    }

    return new DownloadedResource(data, mimeType, fileName);
  }

  /**
   * In Nodejs it will return a {@link Buffer} and in the browser it will respond with a {@link ArrayBuffer}
   * @returns {ArrayBuffer|Buffer} - resource data
   */
  get data () {
    return this._data;
  }

  /**
   * Resource mime-type
   * @return {string} - mime-type
   */
  get type () {
    return this._type;
  }

  /**
   * Resource file name, if available
   * @return {string} - file name
   */
  get fileName () {
    return this._fileName;
  }

  /**
   * Get the size of the data
   * @return {Number} - size in bytes
   */
  get size () {
    return this.data.length;
  }

  /**
   * Create a object url
   * The URL lifetime is tied to the document in the window on which it
   * was created. The new object URL represents the resource.
   * *Do not forget* to release the object urls once used.
   * @see https://developer.mozilla.org/en-US/docs/Web/API/URL/createObjectURL
   * @see https://developer.mozilla.org/en-US/docs/Web/API/URL/createObjectURL#Memory_management
   * @return {string} - object url
   */
  createObjectUrl () {
    if (isNode()) {
      throw new Error('Object urls are not supported by Node');
    }

    return URL.createObjectURL(this.createBlob());
  }

  /**
   * Create a blob from the resource
   * @returns {Blob}
   */
  createBlob () {
    return new Blob([this.data], { type: this.type });
  }

  /**
   * Get base64-encoded data uri
   * @see https://developer.mozilla.org/en-US/docs/Web/HTTP/Basics_of_HTTP/Data_URIs
   * @returns {string} - data uri
   */
  toDataUri () {
    return `data:${this.type};base64,${this.toBase64()}`;
  }

  /**
   * Base64 encode data
   * @returns {string} - base64 encoded data
   */
  toBase64 () {
    return base64Encode(this.data);
  }

  /**
   * @inheritDoc
   */
  toString () {
    return this.data.toString();
  }
}
