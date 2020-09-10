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

import ApiError from './ApiError';

/**
 * Contains schema errors.
 * Normally thrown when a job object is invalid.
 *
 * @typedef {Object} SchemaError
 * @property {string} property - json property
 * @property {string} pointer - json pointer
 * @property {string} message - error message
 * @property {number} context -
 * @property {Object} constraint -
 * @property {Object<string, string>} constraint.params -
 * @property {string} constraint.name -
 * @see https://github.com/justinrainbow/json-schema
 * @example
 * {
 *   property: "data.meta",
 *   pointer: "/data/meta",
 *   message: "The property meta is required",
 *   constraint: {
 *     name: "required",
 *     params: {
 *       property: "meta"
 *     }
 *   },
 *   context: 1
 * }
 */

/**
 * Extension of {@link ApiError} containing an extra field for validation errors
 */
export default class ValidationError extends ApiError {

  /**
   * Any validation errors
   * @type {Object.<String, Array<String>>} - Object containing arrays of validation errors where the field is stored in the key
   */
  validationErrors;

  /**
   * Get the schema errors if available
   * @type {SchemaError[]} - Array containing schema errors
   * @see {@link hasSchemaErrors}
   * @example
   * [
   *   {
   *     "property": "data.meta",
   *     "pointer": "/data/meta",
   *     "message": "The property meta is required",
   *     "constraint": {
   *       "name": "required",
   *       "params": {
   *         "property": "meta"
   *       }
   *     },
   *     "context": 1
   *   },
   *    {
   *     "property": "data.paper",
   *     "pointer": "/data/paper",
   *     "message": "The property paper is required",
   *     "constraint": {
   *       "name": "required",
   *       "params": {
   *         "property": "paper"
   *       }
   *     },
   *     "context": 1
   *   },
   *    {
   *     "property": "data.scaleDefinition",
   *     "pointer": "/data/scaleDefinition",
   *     "message": "The property scaleDefinition is required",
   *     "constraint": {
   *       "name": "required",
   *       "params": {
   *         "property": "scaleDefinition"
   *       }
   *     },
   *     "context": 1
   *   }
   * ]
   */
  schemaErrors;

  /**
   * @param {Object} params
   * @param {Object} params.options - Request options
   * @param {Object} params.data - Response data
   * @param {Request} params.request - Request
   * @param {Response} params.response - Response
   */
  constructor ({ options, request, response, data }) {
    super({ options, request, response, data });

    const schemaErrors = data.error['schema_errors'];

    this.validationErrors = data.error['validation_errors'];
    this.schemaErrors = Array.isArray(schemaErrors) ? schemaErrors : [];
  }

  /**
   * True if the error contains schema errors
   * @return {boolean} - Has schema errors
   */
  get hasSchemaErrors () {
    return this.schemaErrors.length > 0;
  }

  /**
   * Get validation error messages
   * @returns {Array<String>} - All validation messages
   */
  get messages () {
    const out = [];

    for (const key of Object.keys(this.validationErrors)) {
      out.push(...this.validationErrors[key]);
    }

    return out;
  }

  /**
   * @inheritDoc
   */
  toString () {
    return `There were some validation errors: ${this.messages.join(', ')}`;
  }
}
