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

import OwnedResourceProxy from '../proxy/OwnedResourceProxy';
import ResourceProxy from '../proxy/ResourceProxy';
import ResourceBase from '../resources/base/ResourceBase';
import {hasTrait, isParentOf} from '../utils/reflection';
import OwnableResource from './OwnableResource';
import Trait from './Trait';


/**
 * Adds the imageHandler to a resource
 *
 * @pro
 */
export default class Injectable extends Trait {
  initializer() {
    const injectable = this.constructor._injectable || {};

    for (const name of Object.keys(injectable)) {
      const value = injectable[name];

      this.inject(name, value);
    }
  }

  /**
   * @param {string|object} name
   * @param {function?} value
   *
   * @example
   */
  static inject(name, value) {
    if (!value) {
      // Handle vue-style injections `.inject({ Foo, Bar, Baz })`
      for (const key of Object.keys(name)) {
        this.inject(key, name[key]);
      }
    } else {
      if (typeof this._injectable === 'undefined') {
        this._injectable = {};
      }

      this._injectable[name] = value;
    }
  }

  static uninject(name) {
    if (typeof this._injectable !== 'undefined') {
      delete this._injectable[name];
    }
  }

  inject(name, value) {
    if (!value) {
      // Handle vue-style injections `.inject({ Foo, Bar, Baz })`
      for (const key of Object.keys(name)) {
        this.inject(key, name[key]);
      }
    } else if (isParentOf(ResourceBase, value)) {
      this._injectRelation(name, value);
    } else {
      this._inject(name, value);
    }
  }

  _injectRelation(name, value) {
    if (hasTrait(value, OwnableResource)) {
      this._inject(name, function () {
        new OwnedResourceProxy(this.api, this, value);
      });
    } else if (isParentOf(ResourceBase, value)) {
      // returns a SimpleResourceProxy
      this._inject(name, function () {
        return this._proxyResourceList(value);
      });
    } else {
      this._inject(name, function () {
        return new ResourceProxy(this, value);
      });
    }
  }

  _inject(name, value) {
    // Not sure if I should enable this
    // name = name.replace(/^\w/, c => c.toLowerCase());

    Object.defineProperty(this, name, {
      enumerable: false,
      configurable: false,
      writable: false,
      get: value,
    });
  }
}
