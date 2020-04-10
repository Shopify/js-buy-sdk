/**
 * @namespace ImageHelpers
 */
export default {

  /**
   * Generates the image src for a resized image with maximum dimensions `maxWidth` and `maxHeight`.
   * Images do not scale up.
   *
   * @example
   * const url = client.image.helpers.imageForSize(product.variants[0].image, {maxWidth: 50, maxHeight: 50});
   *
   * @memberof ImageHelpers
   * @method imageForSize
   * @param {Object} image The original image model to generate the image src for.
   * @param {Object} options An options object containing:
   *  @param {Integer} options.maxWidth The maximum width for the image.
   *  @param {Integer} options.maxHeight The maximum height for the image.
   * @return {String} The image src for the resized image.
   */
  imageForSize(image, {maxWidth, maxHeight}) {
    if (!image) {
      return '';
    }
    const splitUrl = image.src.split('?');
    const notQuery = splitUrl[0];
    const query = splitUrl[1] ? `?${splitUrl[1]}` : '';

    // Use the section before the query
    const imageTokens = notQuery.split('.');

    // Take the token before the file extension and append the dimensions
    const imagePathIndex = imageTokens.length - 2;

    imageTokens[imagePathIndex] = `${imageTokens[imagePathIndex]}_${maxWidth}x${maxHeight}`;

    return `${imageTokens.join('.')}${query}`;
  }
};
