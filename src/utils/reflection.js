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

import Trait from '../traits/Trait';
import {fnv32b} from './hash';

/**
 * Tests if the parent is a parent of child
 * @param {function|object} parent - Instance or Class
 * @param {function|object} child - Instance or Class
 * @returns {boolean} - is parent a parent of child
 * @private
 * @example
 * class A {}
 * class B extends A {}
 * class C extends B {}
 *
 * isParentOf(A, C) // true
 * isParentOf(B, C) // true
 * isParentOf(C, C) // true
 * isParentOf(B, A) // false
 */
export function isParentOf(parent, child) {
  if (parent == null || child == null) {
    return false;
  }

  parent = typeof parent === 'function' ? parent : parent.constructor;
  child = typeof child === 'function' ? child : child.constructor;

  do {
    if (child.name === parent.name) {
      return true;
    }

    child = Object.getPrototypeOf(child);
  } while (child.name !== '');

  return false;
}


/**
 * Get the name of the value type
 * @param {*} value - Any value
 * @private
 * @returns {string} - Value type name
 */
export function getTypeName(value) {
  value = typeof value === 'function' ? value : value.constructor;

  return value.name;

}

/**
 * Helper class for mix
 * @see mix
 */
class Empty {}

/**
 * Mix traits into the target class
 * @param {Function} baseClass - Target base class for the traits to be applied to
 * @param {Function} mixins - Traits to be applied
 * @returns {Function} - Constructor with any traits applied
 * @private
 */
export function mix(baseClass, ...mixins) {
  const cocktail = class _Cocktail extends (baseClass || Empty) {
    constructor(...args) {
      super(...args);

      mixins
        .map(mixin => mixin.prototype.initializer)
        .filter(initializer => typeof initializer === 'function')
        .forEach(initializer => initializer.call(this));
    }
  };


  for (const mixin of mixins) {
    if (!isParentOf(Trait, mixin)) {
      throw new TypeError(`Expected mixin to implement Trait for ${mixin.name}`);
    }

    copyProps(cocktail.prototype, mixin.prototype);
    copyProps(cocktail, mixin);
  }

  cocktail.__mixins = mixins;

  const hash = fnv32b(mixins.map(x => x.name).join(','));

  Object.defineProperty(cocktail, 'name', {value: `Cocktail_${hash}`});

  return cocktail;
}

/**
 * Copy properties from source to target
 * @param {object} target - Object for the properties to be copied to
 * @param {object} source - Object containing properties to be copied
 */
function copyProps(target, source) {
  Object
    .getOwnPropertyNames(source)
    .concat(Object.getOwnPropertySymbols(source))
    .forEach((prop) => {
      if (!prop.match(/^(?:constructor|initializer|prototype|arguments|caller|name|bind|call|apply|toString|length)$/)) {
        Object.defineProperty(target, prop, Object.getOwnPropertyDescriptor(source, prop));
      }
    });
}

/**
 * Checks if the target has a certain trait.
 *
 * @param {Function|Object} Subject - Instance or class
 * @param {Function} Trait - Trait to check for
 * @returns {boolean} - If the subject has the trait
 */
export function hasTrait(Subject, Trait) {
  Subject = typeof Subject === 'function' ? Subject : Subject.constructor;

  do {
    if (Array.isArray(Subject.__mixins) && Subject.__mixins.includes(Trait)) {
      return true;
    }

    Subject = Object.getPrototypeOf(Subject);
  } while (Subject.name !== '');

  return false;
}
