/**
 * @namespace ProductHelpers
 */
export default {

  /**
   * Returns the variant of a product corresponding to the options given.
   *
   * @example
   * const selectedVariant = client.product.helpers.variantForOptions(product, {
   *   size: "Small",
   *   color: "Red"
   * });
   *
   * @memberof ProductHelpers
   * @method variantForOptions
   * @param {GraphModel} product The product to find the variant on. Must include `variants`.
   * @param {Object} options An object containing the options for the variant.
   * @return {GraphModel} The variant corresponding to the options given.
   */
  variantForOptions(product, options) {
    return product.variants.find((variant) => {
      return variant.selectedOptions.every((selectedOption) => {
        return options[selectedOption.name] === selectedOption.value.valueOf();
      });
    });
  }
};
