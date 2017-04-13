import {generateUUID, StaticClassError} from "../util";


export default class StateContainer {
  constructor() {
    throw StaticClassError();
  }

  static get prefix() {
    return 'm4n_state_';
  }

  static generate() {
    const key = StateContainer.prefix + Date.now();
    const value = generateUUID();

    localStorage.setItem(key, value);
    return value;
  }

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

  static clean() {
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      const key_prefix = key.slice(0, StateContainer.prefix.length);

      if (key_prefix === StateContainer.prefix) {
        localStorage.removeItem(key);
      }
    }
  }

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