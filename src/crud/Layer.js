import OwnableResource from '../traits/OwnableResource';
import CrudBase from './base/CrudBase';
import ImageHandler from './base/ImageHandler';
import {mix} from '../utils/reflection';

/**
 * Layer
 * @extends {CrudBase}
 * @extends {OwnableResource}
 */
export default class Layer extends mix(CrudBase, OwnableResource) {
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
