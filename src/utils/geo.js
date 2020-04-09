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


import GeoError from '../errors/GeoError';

/**
 * A geographical point
 */
export class GeoPoint {
  /**
   * Geographical point
   * @param {Number} lat - latitude
   * @param {Number} lng - longitude
   */
  constructor (lat, lng) {
    this.lat = lat;
    this.lng = lng;
  }

  /**
   * Get latitude
   * @returns {Number} - latitude
   */
  get lat () {
    return this._lat;
  }

  /**
   * Set latitude
   * @param {Number} value - latitude
   */
  set lat (value) {
    value = Number(value);

    if (!Number.isFinite(value)) {
      throw new GeoError(`Invalid latitude: ${value}`);
    }

    this._lat = Math.min(90, Math.max(-90, value));
  }

  /**
   * Get longitude
   * @returns {Number} - longitude
   */
  get lng () {
    return this._lng;
  }

  /**
   * Set longitude
   * @param {Number} value - longitude
   */
  set lng (value) {
    value = Number(value);

    if (!Number.isFinite(value)) {
      throw new GeoError(`Invalid longitude: ${value}`);
    }

    this._lng = value;
  }

  /**
   * Get data to be JSON encoded
   * @returns {{lat: Number, lng: Number}} - data
   */
  toJSON () {
    return { lat: this.lat, lng: this.lng };
  }
}

/**
 * Geometric boundary
 */
export class GeoBoundary {
  /**
   * Geometric boundary
   * @param {Object} topLeft - top left corner of the boundary
   * @param {Number} topLeft.lat - top left corner latitude
   * @param {Number} topLeft.lng - top left corner longitude
   * @param {Object} bottomRight - bottom right corner of the boundary
   * @param {Number} bottomRight.lat - bottom right corner latitude
   * @param {Number} bottomRight.lng - bottom right corner longitude
   */
  constructor ({ lat: lat1, lng: lng1 }, { lat: lat2, lng: lng2 }) {
    this.topLeft = new GeoPoint(lat1, lng1);
    this.bottomRight = new GeoPoint(lat2, lng2);
  }

  getCenter () {
    const lat = (this.topLeft.lat + this.bottomRight.lat) / 2;
    const lng = (this.topLeft.lng + this.bottomRight.lng) / 2;

    return new GeoPoint(lat, lng);
  }

  /**
   * Top left coordinate
   * @type {GeoPoint}
   */
  topLeft;

  /**
   * Bottom right coordinate
   * @type {GeoPoint}
   */
  bottomRight;
}
