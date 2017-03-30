/**
 * @class ImageHelpers
 */
export default class ImageHelpers {

  /**
   * Generates the image src for a resized image with maximum dimensions `maxWidth` and `maxHeight`.
   * Images do not scale up.
   *
   * @method imageForSize
   * @param {Object} image The original image model to generate the image src for
   * @param {Object} options An options object containing:
   *  @param {Integer} options.maxHeight The maximum height for the image
   *  @param {Integer} options.maxWidth The maximum width for the image
   * @return {String} The image src for the resized image
   */
  imageForSize(image, {maxHeight, maxWidth}) {
    const urlTokens = image.src.split('?');

    // Use the section before the query
    const imageTokens = urlTokens[0].split('.');

    // Take the second last token and append the dimensions
    imageTokens[imageTokens.length - 2] = imageTokens[imageTokens.length - 2].concat(`_${maxHeight}x${maxWidth}`);
    urlTokens[0] = imageTokens.join('.');

    return urlTokens.join('?');
  }
}
