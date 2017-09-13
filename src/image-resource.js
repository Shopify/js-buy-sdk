import Resource from './resource';
import imageHelpers from './image-helpers';

export default class ImageResource extends Resource {
  get helpers() {
    return imageHelpers;
  }
}
