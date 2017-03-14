export default class ProductHelpers {
  variantForOptions(product, options) {
    const [selectedVariant] = product.variants.reduce((variantAcc, variant) => {
      const match = variant.selectedOptions.every((selectedOption) => {
        return options[selectedOption.name] === selectedOption.value.valueOf();
      });

      if (match) {
        variantAcc.push(variant);
      }

      return variantAcc;
    }, []);

    return selectedVariant;
  }
}
