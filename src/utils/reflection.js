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
 * Mix traits into the target class
 * @param {Constructor} baseClass - Target base class for the traits to be applied to
 * @param {Constructor} mixins - Traits to be applied
 * @returns {Constructor} - Constructor with any traits applied
 */
export function mix(baseClass, ...mixins) {
  const cocktail = class _Cocktail extends baseClass {
    constructor(...args) {
      super(...args);
      mixins.forEach((mixin) => {
        if (mixin.prototype.initializer) {
          mixin.prototype.initializer.call(this);
        }
      });
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

  return cocktail;
}

/**
 * Copy properties from target to source
 * @param {object} target - Object for the properties to be copied to
 * @param {object} source - Object containing properties to be copied
 * @returns {object} - Resulting object with properties from both parameters
 */
function copyProps(target, source) {
  Object
    .getOwnPropertyNames(source)
    .concat(Object.getOwnPropertySymbols(source))
    .forEach((prop) => {
      if (!prop.match(/^(?:constructor|prototype|arguments|caller|name|bind|call|apply|toString|length)$/)) {
        Object.defineProperty(target, prop, Object.getOwnPropertyDescriptor(source, prop));
      }
    });
}

/**
 * Trait interface
 * @interface
 */
export class Trait {}
