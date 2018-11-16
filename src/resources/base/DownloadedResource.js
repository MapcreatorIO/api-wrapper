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

import {isNode} from '../../utils/node';

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
  constructor(data, type = 'application/octet-stream', fileName = 'Untitled.zip') {
    this._data = data;
    this._type = type;
    this._fileName = fileName;
  }

  /**
   * Build instance from Axios response
   * @param {AxiosResponse} axiosResponse - axios response
   * @returns {DownloadedResource} - instance
   */
  static fromAxiosResponse(axiosResponse) {
    const {data, headers} = axiosResponse;

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
        fileName = matches[3];
      }
    }

    return new DownloadedResource(data, mimeType, fileName);
  }

  /**
   * In Nodejs it will return a {@link Buffer} and in the browser it will respond with a {@link ArrayBuffer}
   * @returns {ArrayBuffer|Buffer} - resource data
   */
  get data() {
    return this._data;
  }

  /**
   * Resource mime-type
   * @return {string} - mime-type
   */
  get type() {
    return this._type;
  }

  /**
   * Resource file name, if available
   * @return {string} - file name
   */
  get fileName() {
    return this._fileName;
  }

  /**
   * Get the size of the data
   * @return {Number} - size in bytes
   */
  get size() {
    return this.data.length;
  }

  /**
   * Create a object url
   * The URL lifetime is tied to the document in the window on which it
   * was created. The new object URL represents the resource.
   * @see https://developer.mozilla.org/en-US/docs/Web/API/URL/createObjectURL
   * @return {string} - object url
   */
  createObjectURL() {
    if (isNode()) {
      throw new Error('Object urls are not supported by Node');
    }

    const blob = new Blob([this.data], {type: this.type});

    return URL.createObjectURL(blob);
  }

  /**
   * Get base64-encoded data uri
   * @see {@link https://developer.mozilla.org/en-US/docs/Web/HTTP/Basics_of_HTTP/Data_URIs}
   * @returns {string} - data uri
   */
  toDataUri() {
    return `data:${this.type};base64,${this.toBase64()}`;
  }

  /**
   * Base64 encode data
   *
   * @author Jon Leighton
   * @license MIT
   * @see (@link https://gist.github.com/jonleighton/958841)
   * @returns {string} - base 64 encoded data
   */
  toBase64() {
    let base64 = '';
    const encodings = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/';

    const bytes = new Uint8Array(this.data);
    const byteLength = bytes.byteLength;
    const byteRemainder = byteLength % 3;
    const mainLength = byteLength - byteRemainder;

    let a, b, c, d;
    let chunk;

    // Main loop deals with bytes in chunks of 3
    for (let i = 0; i < mainLength; i = i + 3) {
      // Combine the three bytes into a single integer
      chunk = bytes[i] << 16 | bytes[i + 1] << 8 | bytes[i + 2];

      // Use bitmasks to extract 6-bit segments from the triplet
      a = (chunk & 16515072) >> 18; // 16515072 = (2^6 - 1) << 18
      b = (chunk & 258048) >> 12; // 258048   = (2^6 - 1) << 12
      c = (chunk & 4032) >> 6; // 4032     = (2^6 - 1) << 6
      d = chunk & 63; // 63       = 2^6 - 1

      // Convert the raw binary segments to the appropriate ASCII encoding
      base64 += encodings[a] + encodings[b] + encodings[c] + encodings[d];
    }

    // Deal with the remaining bytes and padding
    if (byteRemainder === 1) {
      chunk = bytes[mainLength];

      a = (chunk & 252) >> 2; // 252 = (2^6 - 1) << 2

      // Set the 4 least significant bits to zero
      b = (chunk & 3) << 4; // 3   = 2^2 - 1

      base64 += encodings[a] + encodings[b] + '==';
    } else if (byteRemainder === 2) {
      chunk = bytes[mainLength] << 8 | bytes[mainLength + 1];

      a = (chunk & 64512) >> 10; // 64512 = (2^6 - 1) << 10
      b = (chunk & 1008) >> 4; // 1008  = (2^6 - 1) << 4

      // Set the 2 least significant bits to zero
      c = (chunk & 15) << 2; // 15    = 2^4 - 1

      base64 += encodings[a] + encodings[b] + encodings[c] + '=';
    }

    return base64;
  }

  /**
   * @inheritDoc
   */
  toString() {
    return this.data.toString();
  }
}
