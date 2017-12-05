import Resource from './resource';
import imageHelpers from './image-helpers';

/**
 * The JS Buy SDK image resource
 * @class
 */
class ImageResource extends Resource {
  get helpers() {
    return imageHelpers;
  }
}

export default ImageResource;
