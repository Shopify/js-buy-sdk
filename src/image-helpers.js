/**
 * @namespace ImageHelpers
 */
export default {

  /**
   * Generates the image src for a resized image with  `maxWidth`, `maxHeight`, `crop`, `scale` and `format` options.
   * Images do not scale up.
   *
   * @example
   * const url = client.image.helpers.imageForSize(product.variants[0].image, {
   *  maxWidth: 50,
   *  maxHeight: 50,
   *  crop: 'center',
   *  scale: 2,
   *  format: 'pjpg'
   * });
   *
   * @memberof ImageHelpers
   * @method imageForSize
   * @param {Object} image The original image model to generate the image src for.
   * @param {Object} options An options object containing:
   * @param {Integer} options.maxWidth The maximum width for the image.
   * @param {Integer} options.maxHeight The maximum height for the image.
   * @param {String} options.crop The crop to determine the returned part of the image. Available values are `top`, `center`, `bottom`, `left`, `right`.
   * @param {Integer} options.scale The pixel density for the image. Available values are 2 and 3.
   * @param {String} options.format The format for the image. Available values are `jpg` and `pjpg`.


   * @return {String} The image src for the resized image.
   */
  imageForSize(image, {maxWidth, maxHeight, crop, scale, format}) {
    const splitUrl = image.src.split('?');
    const withoutQuery = splitUrl[0];
    const query = splitUrl[1] ? `?${splitUrl[1]}` : '';

    // Use the section before the query
    const imageTokens = withoutQuery.split('.');

    const queryBuilder = [];

    // Adds the dimensions query if either maxWidth or maxHeight exists.
    queryBuilder.push((maxWidth || maxHeight) ? `_${maxWidth}x${maxHeight}` : '');

    // Adds the crop query if it exists.
    queryBuilder.push(crop ? `_crop_${crop}` : '');

    // Adds the scale query if it exists.
    queryBuilder.push(scale ? `@${scale}x` : '');

    // Makes the image progressive if passed as an option.
    queryBuilder.push(format === 'progressive' ? '.progressive' : '');

    // Adjusts the image format to jpg if the option is passed.
    const lastImageToken = imageTokens.length - 1;

    imageTokens[lastImageToken] = (format && imageTokens[lastImageToken] !== 'jpg') ? `${imageTokens[lastImageToken]}.jpg` : imageTokens[lastImageToken];

    // Take the token before the file extension and append the dimensions
    const imagePathIndex = imageTokens.length - 2;

    imageTokens[imagePathIndex] = `${imageTokens[imagePathIndex]}${queryBuilder.join('')}`;

    return `${imageTokens.join('.')}${query}`;
  }
};
