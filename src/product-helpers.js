/**
 * @namespace Client.Product.Helpers
 */
export default {

  /**
   * Returns the variant of a product corresponding to the options given.
   *
   * @memberof Client.product.Helpers
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
