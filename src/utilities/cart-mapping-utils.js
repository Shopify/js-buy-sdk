import {discountMapper, getDiscountAllocationId, getDiscountApplicationId} from './cart-discount-mapping';

export function getVariantType() {
  return {
    name: 'ProductVariant',
    kind: 'OBJECT',
    fieldBaseTypes: {
      availableForSale: 'Boolean',
      compareAtPrice: 'MoneyV2',
      id: 'ID',
      image: 'Image',
      price: 'MoneyV2',
      product: 'Product',
      selectedOptions: 'SelectedOption',
      sku: 'String',
      title: 'String',
      unitPrice: 'MoneyV2',
      unitPriceMeasurement: 'UnitPriceMeasurement',
      weight: 'Float'
    },
    implementsNode: true
  };
}

export function getLineItemType() {
  return {
    name: 'CheckoutLineItem',
    kind: 'OBJECT',
    fieldBaseTypes: {
      customAttributes: 'Attribute',
      discountAllocations: 'Object[]',
      id: 'ID',
      quantity: 'Int',
      title: 'String',
      variant: 'Merchandise'
    },
    implementsNode: true
  };
}

function getDiscountAllocationType() {
  return {
    fieldBaseTypes: {
      allocatedAmount: 'MoneyV2',
      discountApplication: 'DiscountApplication'
    },
    implementsNode: false,
    kind: 'OBJECT',
    name: 'DiscountAllocation'
  };
}

export function mapVariant(merchandise) {
  // Copy all properties except 'product'
  const result = {};

  for (const key in merchandise) {
    if (merchandise.hasOwnProperty(key) && key !== 'product') {
      result[key] = merchandise[key];
    }
  }

  // The actual Cart merchandise and Checkout variant objects map cleanly to each other,
  // but the SDK wasn't fetching the title from the product object, so we need to remove it
  const productWithoutTitle = {};

  if (merchandise.product) {
    for (const key in merchandise.product) {
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

export function mapDiscountAllocations(discountAllocations, discountApplications) {
  if (!discountAllocations) { return []; }

  const result = [];

  for (let i = 0; i < discountAllocations.length; i++) {
    const allocation = discountAllocations[i];
    let application = null;

    for (let j = 0; j < discountApplications.length; j++) {
      if (getDiscountAllocationId(allocation) === getDiscountApplicationId(discountApplications[j])) {
        application = discountApplications[j];
        break;
      }
    }

    if (!application) {
      throw new Error(`Missing discount application for allocation: ${JSON.stringify(allocation)}`);
    }

    const discountApp = Object.assign({}, application);

    result.push({
      allocatedAmount: allocation.discountedAmount,
      discountApplication: discountApp,
      type: getDiscountAllocationType()
    });
  }

  return result;
}

export function mapLineItems(lines, discountApplications, skipDiscounts = false) {
  if (!lines || !Array.isArray(lines)) { return []; }

  const result = [];

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];

    if (!line || !line.merchandise || !line.merchandise.product) { continue; }

    const variant = mapVariant(line.merchandise);

    let discountAllocations = [];

    if (!skipDiscounts) {
      try {
        discountAllocations = mapDiscountAllocations(line.discountAllocations || [], discountApplications);
      } catch (error) {
        // eslint-disable-next-line no-console
        console.error('Error mapping discount allocations:', error.message);
        discountAllocations = [];
      }
    }

    result.push({
      customAttributes: line.attributes,
      discountAllocations,
      id: line.id,
      quantity: line.quantity,
      title: line.merchandise.product.title,
      variant,
      hasNextPage: false,
      hasPreviousPage: false,
      variableValues: line.variableValues,
      type: getLineItemType()
    });
  }

  return result;
}

export function mapDiscountsAndLines(cart) {
  if (!cart) { return {discountApplications: [], cartLinesWithDiscounts: []}; }

  let discountMappingResult;
  let discountMappingFailed = false;

  try {
    discountMappingResult = discountMapper({
      cartLineItems: cart.lines || [],
      cartDiscountAllocations: cart.discountAllocations || [],
      cartDiscountCodes: cart.discountCodes || []
    });
  } catch (error) {
    // eslint-disable-next-line no-console
    console.error('Error mapping discounts:', error.message);
    discountMappingFailed = true;
  }

  let mappedLines;

  if (discountMappingFailed) {
    // When discount mapping fails, still map the lines but without any discount allocations
    // eslint-disable-next-line newline-after-var
    const linesWithClearedDiscounts = (cart.lines || []).map((line) => {
      const lineCopy = Object.assign({}, line);

      lineCopy.discountAllocations = [];

      return lineCopy;
    });
    mappedLines = mapLineItems(linesWithClearedDiscounts, [], true);
  } else {
    // Normal path when discount mapping succeeds
    mappedLines = mapLineItems(
      discountMappingResult.cartLinesWithAllDiscountAllocations || [],
      discountMappingResult.discountApplications || []
    );
  }

  return {
    discountApplications: discountMappingFailed ? [] : ((discountMappingResult && discountMappingResult.discountApplications) || []),
    cartLinesWithDiscounts: mappedLines
  };
}
