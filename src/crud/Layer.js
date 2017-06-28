import {mix} from 'mixwith/src/mixwith';
import {OwnableResource} from '../traits/OwnableResource';
import CrudBase from './base/CrudBase';
import ImageHandler from './base/ImageHandler';

export default class Layer extends mix(CrudBase).with(OwnableResource) {
  /**
   * Handler for item image management
   * @returns {ImageHandler} - Image handler
   */
  get imageHandler() {
    return new ImageHandler(this.api, this);
  }

  get resourceName() {
    return 'layers';
  }
}
