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

import ResourceBase from '../resources/base/ResourceBase';
import { hasTrait, isParentOf } from '../utils/reflection';
import Trait from './Trait';

/**
 * Adds the possibility to inject proxies/methods
 *
 * @mixin
 */
export default class Injectable extends Trait {
  /**
   * Inject proxies and methods during the constructor
   */
  initializer () {
    const injectable = this.constructor._injectable || {};

    for (const name of Object.keys(injectable)) {
      const { value, isProxy } = injectable[name];

      if (isProxy) {
        this.injectProxy(name, value);
      } else {
        this.inject(name, value);
      }
    }
  }

  /**
   * Inject a proxy property into future instances
   *
   * @param {string|object} name - Name of the property
   * @param {function?} value - Either a resource or a function that returns a proxy
   *
   * @example
   *
   * Maps4News.injectProxy({Domain});
   *
   * // After creating new api instance
   *
   * api.domains // returns proxy
   */
  static injectProxy (name, value) {
    if (value) {
      if (typeof this._injectable === 'undefined') {
        this._injectable = {};
      }

      this._injectable[name] = { value, isProxy: true };
    } else {
      // Handle vue-style injections `.inject({ Foo, Bar, Baz })`
      for (const key of Object.keys(name)) {
        this.inject(key, name[key]);
      }
    }
  }

  /**
   * Inject a property into future instances
   *
   * @param {string|object} name - Name of the property
   * @param {function?} value - Any function that does not return a proxy
   *
   */
  static inject (name, value) {
    if (value) {
      if (typeof this._injectable === 'undefined') {
        this._injectable = {};
      }

      this._injectable[name] = { value, isProxy: false };
    } else {
      // Handle vue-style injections `.inject({ Foo, Bar, Baz })`
      for (const key of Object.keys(name)) {
        this.inject(key, name[key]);
      }
    }
  }

  /**
   * Prevent a property from being injected
   * @param {string} name - Name of the property
   */
  static uninject (name) {
    if (typeof this._injectable !== 'undefined') {
      delete this._injectable[name];
    }
  }

  /**
   * Inject a proxy
   * @param {string} name - Name of the property
   * @param {function?} value - Either a resource or a function that returns a proxy
   */
  injectProxy (name, value) {
    if (!value) {
      // Handle vue-style injections `.inject({ Foo, Bar, Baz })`
      for (const key of Object.keys(name)) {
        this.injectProxy(key, name[key]);
      }
    } else if (isParentOf(ResourceBase, value)) {
      this._injectProxy(name, value);
    } else {
      this._inject(name, value);
    }
  }

  /**
   * Inject a property into the instance
   *
   * @param {string|object} name - Name of the property
   * @param {function?} value - Any function that does not return a proxy
   *
   */
  inject (name, value) {
    this._inject(name, value, false);
  }

  /**
   * Revert a proxy injection in instance, won't delete non-injected properties
   *
   * @param {string} name - property name
   * @throws Error when the property was not injected
   */
  uninject (name) {
    const descriptor = Object.getOwnPropertyDescriptor(this, name);
    const value = descriptor.value || descriptor.get || {};

    if (!value.injected) {
      throw new Error(`Property "${name}" was not injected, can't un-inject`);
    }

    if (value.original) {
      Object.defineProperty(this, name, value.original);
    } else {
      Object.defineProperty(this, name, {
        // eslint-disable-next-line no-undefined
        value: undefined,
        enumerable: false,
        writable: true,
      });
    }
  }

  _injectProxy (name, value) {
    if (name === value.name) {
      name = `${name.replace(/^\w/, c => c.toLowerCase())}s`;
    }

    const OwnableResource = require('./OwnableResource').default;

    if (hasTrait(value, OwnableResource)) {
      const OwnedResourceProxy = require('../proxy/OwnedResourceProxy').default;

      this._inject(name, function () {
        return new OwnedResourceProxy(this.api, this, value);
      });
    } else if (isParentOf(ResourceBase, value) && this._proxyResourceList) {
      // returns a SimpleResourceProxy
      this._inject(name, function () {
        return this._proxyResourceList(value);
      });
    } else {
      const ResourceProxy = require('../proxy/ResourceProxy').default;

      this._inject(name, function () {
        return new ResourceProxy(this, value);
      });
    }
  }

  _inject (name, value, getter = true) {
    const func = (...args) => value.apply(this, args);
    const original = Object.getOwnPropertyDescriptor(this, name);

    func.injected = true;

    // Store the original property descriptor if available
    if (original) {
      func.original = original;
    }

    Object.defineProperty(this, name, {
      enumerable: false,
      configurable: true,

      [getter ? 'get' : 'value']: func,
    });
  }
}
