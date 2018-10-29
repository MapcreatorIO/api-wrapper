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

import ApiError from './ApiError';

/**
 * Extension of {@link ApiError} containing an extra field for validation errors
 */
export default class ValidationError extends ApiError {
  /**
   * @param {AxiosError} error - Axios error
   * @param {AxiosRequestConfig} error.config - Request config
   * @param {XMLHttpRequest|ClientRequest} request - Request
   * @param {AxiosResponse} response - Response
   */
  constructor({config, request, response}) {
    super({config, request, response});

    this._validationErrors = response.data.error['validation_errors'];
  }

  /**
   * Any validation errors
   * @returns {Object.<String, Array<String>>} - Object containing arrays of validation errors where the field is stored in the key
   */
  get validationErrors() {
    return this._validationErrors;
  }

  /**
   * Get validation error messages
   * @returns {Array<String>} - All validation messages
   */
  get messages() {
    const out = [];

    for (const key of Object.keys(this.validationErrors)) {
      out.push(...this.validationErrors[key]);
    }

    return out;
  }

  /**
   * @inheritDoc
   */
  toString() {
    return `There were some validation errors: ${this.messages.join(', ')}`;
  }
}
