import { discountMapper, getDiscountAllocationId, getDiscountApplicationId } from './cart-discount-mapping';

function getVariantType() {
  return {
    name: "ProductVariant",
    kind: "OBJECT",
    fieldBaseTypes: {
      availableForSale: "Boolean",
      compareAtPrice: "MoneyV2",
      id: "ID",
      image: "Image",
      price: "MoneyV2",
      product: "Product",
      selectedOptions: "SelectedOption",
      sku: "String",
      title: "String",
      unitPrice: "MoneyV2",
      unitPriceMeasurement: "UnitPriceMeasurement",
      weight: "Float"
    },
    implementsNode: true
  };
}

function getLineItemType() {
  return {
    name: "CheckoutLineItem",
    kind: "OBJECT",
    fieldBaseTypes: {
      customAttributes: "Attribute",
      discountAllocations: "Object[]",
      id: "ID",
      quantity: "Int",
      title: "String",
      variant: "Merchandise"
    },
    implementsNode: true
  };
}

function mapVariant(merchandise) {
  // Copy all properties except 'product'
  var result = {};
  for (var key in merchandise) {
    if (merchandise.hasOwnProperty(key) && key !== 'product') {
      result[key] = merchandise[key];
    }
  }

  // The actual Cart merchandise and Checkout variant objects map cleanly to each other,
  // but the SDK wasn't fetching the title from the product object, so we need to remove it
  var productWithoutTitle = {};
  if (merchandise.product) {
    for (var key in merchandise.product) {
      if (merchandise.product.hasOwnProperty(key) && key !== 'title') {
        productWithoutTitle[key] = merchandise.product[key];
      }
    }
  }

  // Add additional properties
  result.priceV2 = merchandise.price;
  result.compareAtPriceV2 = merchandise.compareAtPrice;
  result.product = productWithoutTitle;
  result.type = getVariantType();

  return result;
}

function mapDiscountAllocations(discountAllocations, discountApplications) {
  var result = [];
  for (var i = 0; i < discountAllocations.length; i++) {
    var allocation = discountAllocations[i];
    var application = null;
    
    for (var j = 0; j < discountApplications.length; j++) {
      if (getDiscountAllocationId(allocation) === getDiscountApplicationId(discountApplications[j])) {
        application = discountApplications[j];
        break;
      }
    }

    if (!application) {
      throw new Error('Missing discount application for allocation: ' + JSON.stringify(allocation));
    }

    result.push({
      allocatedAmount: allocation.discountedAmount,
      discountApplication: application
    });
  }

  return result;
}

function mapLineItems(lines, discountApplications) {
  if (!lines) return [];

  var result = [];
  for (var i = 0; i < lines.length; i++) {
    var line = lines[i];
    var variant = mapVariant(line.merchandise);
    
    result.push({
      customAttributes: line.attributes,
      discountAllocations: mapDiscountAllocations(line.discountAllocations || [], discountApplications),
      id: line.id,
      quantity: line.quantity,
      title: line.merchandise.product.title,
      variant: variant,
      hasNextPage: line.hasNextPage,
      hasPreviousPage: line.hasPreviousPage,
      variableValues: line.variableValues,
      type: getLineItemType()
    });
  }

  return result;
}

export function mapDiscountsAndLines(cart) {
  var result = discountMapper({
    cartLineItems: cart.lineItems || [],
    cartDiscountAllocations: cart.discountAllocations || [],
    cartDiscountCodes: cart.discountCodes || []
  });

  var mappedLines = mapLineItems(result.cartLinesWithAllDiscountAllocations, result.discountApplications);

  return {
    discountApplications: result.discountApplications,
    cartLinesWithDiscounts: mappedLines
  };
}

module.exports = {
  getVariantType: getVariantType,
  getLineItemType: getLineItemType,
  mapVariant: mapVariant,
  mapDiscountAllocations: mapDiscountAllocations,
  mapLineItems: mapLineItems,
  mapDiscountsAndLines: mapDiscountsAndLines
}; 