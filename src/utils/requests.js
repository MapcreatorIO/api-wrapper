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

import axios from 'axios';
import fetchPonyfill from 'fetch-ponyfill';
import ApiError from '../errors/ApiError';
import ValidationError from '../errors/ValidationError';
import {windowTest} from './helpers';

/**
 * @private
 */
export const {fetch, Request, Response, Headers} = windowTest('fetch') ? window : fetchPonyfill({Promise});

function getFormData() {
  if (windowTest('FormData')) {
    return window.FormData;
  }

  return require('form-data');
}

/**
 * @private
 */
export const FormData = getFormData();

/**
 * Encodes an object to a http query string with support for recursion
 * @param {object<string, *>} paramsObject - data to be encoded
 * @returns {string} - encoded http query string
 *
 * @private
 */
export function encodeQueryString(paramsObject) {
  const query = _encodeQueryString(paramsObject);

  // Removes any extra unused &'s.
  return query.replace(/^&*|&+(?=&)|&*$/g, '');
}

/**
 * Encodes an object to a http query string with support for recursion
 * @param {Object<string, *>} paramsObject - data to be encoded
 * @param {Array<string>} _basePrefix - Used internally for tracking recursion
 * @returns {string} - encoded http query string
 *
 * @see http://stackoverflow.com/a/39828481
 * @private
 */
function _encodeQueryString(paramsObject, _basePrefix = []) {
  return Object
    .keys(paramsObject)
    .sort()
    .map(key => {
      const prefix = _basePrefix.slice(0);

      if (typeof paramsObject[key] === 'object' && paramsObject[key] !== null) {
        prefix.push(key);

        return _encodeQueryString(paramsObject[key], prefix);
      }

      prefix.push(key);

      let out = '';

      out += encodeURIComponent(prefix.shift()); // main key
      out += prefix.map(item => `[${encodeURIComponent(item)}]`).join(''); // optional array keys

      const value = paramsObject[key];

      if (value !== null && typeof value !== 'undefined') {
        out += '=' + encodeURIComponent(value); // value
      }

      return out;
    }).join('&');
}

/**
 * @param {string} url - Target url
 * @param {object<string, string>} headers - Request headers
 * @returns {PromiseLike<{filename: string, blob: string}>} - filename and blob
 * @private
 */
export function downloadFile(url, headers = {}) {
  const out = {};

  return fetch(url, {headers})
    .then(res => {
      if (res.ok) {
        const disposition = res.headers.get('Content-Disposition');

        if (disposition && disposition.indexOf('attachment') !== -1) {
          const matches = /filename[^;=\n]*=((['"]).*?\2|[^;\n]*)/.exec(disposition);

          if (matches != null && matches[1]) {
            out.filename = matches[1].replace(/['"]/g, '');
          }
        } else {
          out.filename = 'Unknown Filename.zip';
        }

        return res.blob();
      }

      return res.json().then(data => {
        const err = data.error;

        throw new ApiError(err.type, err.message, res.status, err.trace);
      });
    })
    .then(blob => {
      out.blob = (window.URL || window.webkitURL).createObjectURL(blob);

      return out;
    });
}

export function retry429ResponseInterceptor(error) {
  const {response, config} = error;

  if (!config || !response || response.status !== 429) {
    return Promise.reject(error);
  }

  const delay = response.headers['x-ratelimit-reset'] * 1000 || 500;

  config.transformRequest = [data => data];

  return new Promise(resolve => setTimeout(() => resolve(axios.request(config)), delay));
}

export function transformAxiosErrors(error) {
  if (!error || !error.response || !error.response.data) {
    return Promise.reject(error);
  }

  const data = error.response.data;

  if (typeof data !== 'object' || data.success !== false) {
    return Promise.reject(error);
  }

  if (data.error['validation_errors']) {
    return Promise.reject(new ValidationError(error));
  }

  return Promise.reject(new ApiError(error));

  // if (apiError.type === 'AuthenticationException' && apiError.message.startsWith('Unauthenticated') && apiError.code === 401) {
  //   this.logger.warn('Lost Maps4News session, please re-authenticate');
  //
  //   if (this.autoLogout) {
  //     this.logout();
  //   }
  // }
}

export function custom3xxHandler(error) {
  const {response, config} = error;

  // Do nothing with non-3xx responses
  if (response.status < 300 || response.status >= 400) {
    return error;
  }

  let redirectUrl = response.headers.location;

  // Absolute urls on the same domain
  if (redirectUrl.startsWith('/')) {
    const regex = /^(\w+:\/\/[^/]+)/;

    redirectUrl = config.baseURL.match(regex)[1] + redirectUrl;
  }

  // Drop authorization header
  if (!redirectUrl.startsWith(config.baseUrl)) {
    config.transformRequest = [(data, headers) => {
      delete headers.common['Authorization'];
      delete headers['Authorization'];

      return data;
    }, ...Object.values(config.transformRequest)];
  }

  config.url = redirectUrl;

  return axios.request(config);
}
