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
    const [notQuery, query] = image.src.split('?');

    // Use the section before the query
    const imageTokens = notQuery.split('.');

    // Take the token before the file extension and append the dimensions
    const imagePathIndex = imageTokens.length - 2;

    imageTokens[imagePathIndex] = `${imageTokens[imagePathIndex]}_${maxHeight}x${maxWidth}`;

    return `${imageTokens.join('.')}?${query}`;
  }
}
