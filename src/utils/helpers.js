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

/**
 * Get all the pages from a {@link PaginatedResourceListing} or a range
 * @param {Promise<PaginatedResourceListing>|PaginatedResourceListing} page - Promise that returns a {@link PaginatedResourceListing}
 * @param {?Number} [start=1] - Start page
 * @param {?Number} [stop] - Stop page, defaults to the page count if not filled in.
 * @returns {Promise<Array<ResourceBase>>} - multiple pages
 * @throws {ApiError} - If the api returns errors
 * @example
 * import { helpers } from "@mapcreator/api";
 *
 * const promise = api.users.list(1, 50); // 50 per page is more efficient
 *
 * helpers.getPaginatedRange(promise).then(data => {
 *    data.map(row => `[${row.id}] ${row.name}`) // We just want the names
 *        .forEach(console.log) // Log the names and ids of every user
 * })
 */
export async function getPaginatedRange (page, start = 1, stop) {
  // Resolve promise if any
  if (page instanceof Promise) {
    page = await page;
  }

  const out = page.data;
  const promises = [];

  // Handle defaults
  start = start || page.page;
  stop = stop || page.pageCount;

  if (start === page.page) {
    start++;
  }

  // Get all pages
  for (let i = start; i <= stop; i++) {
    promises.push(page.get(i));
  }

  // Resolve
  const rows = await Promise.all(promises);

  return out.concat(...rows.map(x => x.data));
}

/**
 * Async delay
 * @private
 * @param {number} ms - milliseconds
 * @returns {Promise}
 */
export const delay = ms => new Promise(resolve => setTimeout(resolve, ms));

/**
 * Wraps around ky to make it return cancelable requests
 * @param {function(*=, *=): Response} fn - ky instance
 * @returns {function(*=, *=): Response}
 * @private
 */
export function wrapKyCancelable (fn) {
  return (input, options = {}) => {
    if (typeof options === 'object' && options.hasOwnProperty('signal')) {
      return fn(input, options);
    }

    const controller = new AbortController();
    const promise = fn(input, { signal: controller.signal, ...options });

    promise.cancel = () => controller.abort();

    return promise;
  };
}

/**
 * @typedef {Promise} CancelablePromise
 * @property {function(): void} cancel - Cancel the promise
 */

/**
 * Makes a promise cancelable by passing it a signal
 * @param {function} fn - async method
 * @returns {CancelablePromise}
 * @private
 */
export function makeCancelable (fn) {
  const controller = new AbortController();

  const promise = fn(controller.signal);

  if (promise instanceof Promise) {
    promise.cancel = () => controller.abort();
  }

  return promise;
}

/**
 * Convert Date into server format
 * @param {Date} date - Target
 * @returns {String} - Formatted date
 * @private
 */
export function serializeUTCDate (date) {
  if (!(date instanceof Date)) {
    throw new TypeError('Expected date to be of type Date');
  }

  const pad = num => `00${num}`.slice(-Math.max(String(num).length, 2));

  let out = [
    date.getUTCFullYear(),
    date.getUTCMonth() + 1,
    date.getUTCDate(),
  ].map(pad).join('-');

  out += ` ${[
    date.getUTCHours(),
    date.getUTCMinutes(),
    date.getUTCSeconds(),
  ].map(pad).join(':')}`;

  return out;
}