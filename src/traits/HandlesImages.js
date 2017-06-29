import {Trait} from '../utils/reflection';
import ImageHandler from '../crud/base/ImageHandler';


/**
 * Adds the imageHandler to a resource
 */
export default class HandlesImages extends Trait {
  /**
   * Handler for item image management
   * @returns {ImageHandler} - Image handler
   */
  get imageHandler() {
    return new ImageHandler(this.api, this);
  }
}