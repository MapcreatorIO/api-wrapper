/**
 * OAuth state container
 * @static
 */
import StaticClass from "../util/StaticClass";
import Uuid from "../util/uuid";

export default class StateContainer extends StaticClass {
  /**
   * LocalStorage key prefix
   * @returns {string}
   * @constant
   */
  static get prefix() {
    return 'm4n_state_';
  }

  /**
   * Generate and store a state that can be checked at a later point
   * @returns {string} - state
   */
  static generate() {
    const key = StateContainer.prefix + Date.now();
    const value = Uuid.uuid4();

    localStorage.setItem(key, value);
    return value;
  }

  /**
   * Validate a state
   * @param {string} state - state to validate
   * @param {boolean} purge - remove from state db after validation
   * @returns {boolean} state valid
   */
  static validate(state, purge = true) {
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);

      if (localStorage.getItem(key) === state) {
        if (purge) {
          localStorage.removeItem(key);
        }

        return true;
      }
    }

    return false;
  }

  /**
   * Remove all states from the state db
   */
  static clean() {
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      const key_prefix = key.slice(0, StateContainer.prefix.length);

      if (key_prefix === StateContainer.prefix) {
        localStorage.removeItem(key);
      }
    }
  }

  /**
   * Get states with their corresponding state db key
   * @returns {object<string, string>}
   */
  static list() {
    const out = {};

    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      const key_prefix = key.slice(0, StateContainer.prefix.length);

      if (key_prefix === StateContainer.prefix) {
        out[key] = localStorage.getItem(key);
      }
    }

    return out;
  }
}