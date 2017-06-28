import ResourceBase from '../crud/base/ResourceBase';
import {isParentOf} from '../utils/reflection';

export const OwnableResource = superclass => class extends superclass {
  constructor(...args) {
    super(...args);

    if (!isParentOf(ResourceBase, this)) {
      throw new TypeError(`Trait ${this.constructor.name} requires class to be child of ResourceBase`);
    }
  }

  get ownable() {
    return true;
  }
};
