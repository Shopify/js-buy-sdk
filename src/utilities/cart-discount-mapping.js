export function getDiscountAllocationId(discountAllocation) {
  const discountApp = discountAllocation.discountApplication;
  const discountId = discountAllocation.code || discountAllocation.title || discountApp.code || discountApp.title;

  if (!discountId) {
    throw new Error(
      `Discount allocation must have either code or title in discountApplication: ${JSON.stringify(
        discountAllocation
      )}`
    );
  }

  return discountId;
}

export function getDiscountApplicationId(discountApplication) {
  const discountId = discountApplication.code || discountApplication.title;

  if (!discountId) {
    throw new Error(
      `Discount application must have either code or title: ${JSON.stringify(
        discountApplication
      )}`
    );
  }

  return discountId;
}

function convertToCheckoutDiscountApplicationType(cartLineItems, cartOrderLevelDiscountAllocations) {
  // For each discount allocation, move the code/title field to be inside the discountApplication field
  // This is because the code/title field is part of the discount allocation for a Cart, but part of
  // the discount application for a checkout
  for (let i = 0; i < cartLineItems.length; i++) {
    const {discountAllocations} = cartLineItems[i];

    if (!discountAllocations) { continue; }

    for (let j = 0; j < discountAllocations.length; j++) {
      const allocation = discountAllocations[j];
      const newDiscountApplication = Object.assign({},
        allocation.discountApplication || {},
        allocation.code ? {code: allocation.code} : null,
        allocation.title ? {title: allocation.title} : null
      );

      const newAllocation = Object.assign({}, allocation);

      delete newAllocation.code;
      delete newAllocation.title;
      newAllocation.discountApplication = newDiscountApplication;

      discountAllocations[j] = newAllocation;
    }
  }

  for (let i = 0; i < cartOrderLevelDiscountAllocations.length; i++) {
    const allocation = cartOrderLevelDiscountAllocations[i];
    const newDiscountApplication = Object.assign({},
      allocation.discountApplication || {},
      allocation.code ? {code: allocation.code} : null,
      allocation.title ? {title: allocation.title} : null
    );

    const newAllocation = Object.assign({}, allocation);

    delete newAllocation.code;
    delete newAllocation.title;
    newAllocation.discountApplication = newDiscountApplication;

    cartOrderLevelDiscountAllocations[i] = newAllocation;
  }
}

function groupOrderLevelDiscountAllocationsByDiscountId(cartDiscountAllocations) {
  return cartDiscountAllocations.reduce((acc, discountAllocation) => {
    const id = getDiscountAllocationId(discountAllocation);
    const key = id.toLowerCase();

    acc.set(key, [...(acc.get(key) || []), discountAllocation]);

    return acc;
  }, new Map());
}

function findLineIdForEachOrderLevelDiscountAllocation(
  cartLines,
  orderLevelDiscountAllocations
) {
  if (!cartLines.length || !orderLevelDiscountAllocations.length) {
    return [];
  }

  if (orderLevelDiscountAllocations.length % cartLines.length !== 0) {
    throw new Error(
      `Invalid number of order-level discount allocations. For each order-level discount, there must be 1 order-level discount allocation for each line item. 
      Number of line items: ${cartLines.length}. Number of discount allocations: ${orderLevelDiscountAllocations.length}`
    );
  }

  // May have multiple order-level discount allocations for a given line item
  const discountIdToDiscountAllocationsMap =
    groupOrderLevelDiscountAllocationsByDiscountId(orderLevelDiscountAllocations);

  // Sort each array within the Map by discountedAmount so that the lowest discounted amount appears first
  discountIdToDiscountAllocationsMap.forEach((allocations) => {
    allocations.sort(
      (first, second) => first.discountedAmount.amount - second.discountedAmount.amount
    );
  });

  // Sort cart line items so that the item with the lowest cost (after line-level discounts) appears first
  const sortedCartLineItems = [...cartLines].sort((first, second) => {
    return first.cost.totalAmount.amount - second.cost.totalAmount.amount;
  });

  // For each discount, the discount allocation with the smallest amount should be applied
  // to the item with the lowest cost (after line-level discounts)
  return Array.from(discountIdToDiscountAllocationsMap.values()).flatMap(
    (allocations) => {
      return sortedCartLineItems.map((lineItem, index) => {
        return {
          id: lineItem.id,
          discountAllocation: {
            discountedAmount: allocations[index].discountedAmount,
            discountApplication: allocations[index].discountApplication
          }
        };
      });
    }
  );
}

export function discountMapper({cartLineItems, cartDiscountAllocations, cartDiscountCodes}) {
  let hasDiscountAllocations = false;

  for (let i = 0; i < cartLineItems.length; i++) {
    const {discountAllocations} = cartLineItems[i];

    if (discountAllocations && discountAllocations.length) {
      hasDiscountAllocations = true;
      break;
    }
  }
  if (
    !hasDiscountAllocations &&
    !cartDiscountAllocations.length
  ) {
    return {
      discountApplications: [],
      cartLinesWithAllDiscountAllocations: cartLineItems
    };
  }

  convertToCheckoutDiscountApplicationType(cartLineItems, cartDiscountAllocations);

  const cartLinesWithAllDiscountAllocations =
    mergeCartOrderLevelDiscountAllocationsToCartLineDiscountAllocations({
      lineItems: cartLineItems,
      orderLevelDiscountAllocationsForLines: findLineIdForEachOrderLevelDiscountAllocation(
        cartLineItems,
        cartDiscountAllocations
      )
    });

  const discountIdToDiscountApplicationMap = generateDiscountApplications(
    cartLinesWithAllDiscountAllocations,
    cartDiscountCodes
  );

  cartDiscountCodes.forEach(({code, codeIsApplied}) => {
    if (!codeIsApplied) { return; }

    // Check if the code exists in the map (case-insensitive)
    let found = false;

    for (const [key] of discountIdToDiscountApplicationMap) {
      if (key.toLowerCase() === code.toLowerCase()) {
        found = true;
        break;
      }
    }
    if (!found) {
      throw new Error(
        `Discount code ${code} not found in discount application map. 
        Discount application map: ${JSON.stringify(
          discountIdToDiscountApplicationMap
        )}`
      );
    }
  });

  return {
    discountApplications: Array.from(
      discountIdToDiscountApplicationMap.values()
    ),
    cartLinesWithAllDiscountAllocations
  };
}

function mergeCartOrderLevelDiscountAllocationsToCartLineDiscountAllocations({
  lineItems,
  orderLevelDiscountAllocationsForLines
}) {
  return lineItems.map((line) => {
    const lineItemId = line.id;
    // Could have multiple order-level discount allocations for a given line item
    const orderLevelDiscountAllocationsForLine =
      orderLevelDiscountAllocationsForLines
        .filter(({id}) => id === lineItemId)
        .map(({discountAllocation}) => ({
          discountedAmount: discountAllocation.discountedAmount,
          discountApplication: discountAllocation.discountApplication
        }));

    const mergedDiscountAllocations = (line.discountAllocations || []).concat(orderLevelDiscountAllocationsForLine);
    const result = Object.assign({}, line, {
      discountAllocations: mergedDiscountAllocations
    });

    return result;
  });
}

function generateDiscountApplications(cartLinesWithAllDiscountAllocations, discountCodes) {
  const discountIdToDiscountApplicationMap = new Map();

  if (!cartLinesWithAllDiscountAllocations) { return discountIdToDiscountApplicationMap; }

  cartLinesWithAllDiscountAllocations.forEach(({discountAllocations}) => {
    if (!discountAllocations) { return; }

    discountAllocations.forEach((discountAllocation) => {
      createCheckoutDiscountApplicationFromCartDiscountAllocation(discountAllocation, discountIdToDiscountApplicationMap, discountCodes);
    });
  });

  return discountIdToDiscountApplicationMap;
}

function createCheckoutDiscountApplicationFromCartDiscountAllocation(discountAllocation, discountIdToDiscountApplicationMap, discountCodes) {
  const discountApp = discountAllocation.discountApplication;
  const discountId = getDiscountAllocationId(discountAllocation);

  if (!discountId) {
    throw new Error(
      `Discount allocation must have either code or title in discountApplication: ${JSON.stringify(
        discountAllocation
      )}`
    );
  }

  if (discountIdToDiscountApplicationMap.has(discountId.toLowerCase())) {
    const existingDiscountApplication =
      discountIdToDiscountApplicationMap.get(discountId.toLowerCase());

    // if existingDiscountApplication.value is an amount rather than a percentage discount
    if (existingDiscountApplication.value && 'amount' in existingDiscountApplication.value) {
      existingDiscountApplication.value = {
        amount: (Number(existingDiscountApplication.value.amount) + Number(discountAllocation.discountedAmount.amount)).toFixed(2),
        currencyCode: existingDiscountApplication.value.currencyCode,
        type: existingDiscountApplication.value.type
      };
    }
  } else {
    let discountApplication = {
      __typename: 'DiscountApplication',
      targetSelection: discountApp.targetSelection,
      allocationMethod: discountApp.allocationMethod,
      targetType: discountApp.targetType,
      value: discountApp.value,
      hasNextPage: false,
      hasPreviousPage: false
    };

    if ('code' in discountAllocation.discountApplication) {
      const discountCode = discountCodes.find(
        ({code}) => code.toLowerCase() === discountId.toLowerCase()
      );

      if (!discountCode) {
        throw new Error(
          `Discount code ${discountId} not found in cart discount codes. Discount codes: ${JSON.stringify(
            discountCodes
          )}`
        );
      }
      discountApplication = Object.assign({}, discountApplication, {
        code: discountAllocation.discountApplication.code,
        applicable: discountCode.applicable,
        type: {
          fieldBaseTypes: {
            applicable: 'Boolean',
            code: 'String'
          },
          implementsNode: false,
          kind: 'OBJECT',
          name: 'DiscountApplication'
        }
      });
    } else {
      discountApplication = Object.assign({}, discountApplication, {
        title: discountAllocation.discountApplication.title,
        type: {
          fieldBaseTypes: {
            applicable: 'Boolean',
            title: 'String'
          },
          implementsNode: false,
          kind: 'OBJECT',
          name: 'DiscountApplication'
        }
      });
    }

    discountIdToDiscountApplicationMap.set(discountId.toLowerCase(), discountApplication);
  }
}

export function deepSortLines(lineItems) {
  return lineItems
    .map((lineItem) => {
      const sortedDiscountAllocations = lineItem.discountAllocations.sort((first, second) =>
        getDiscountApplicationId(first.discountApplication).localeCompare(
          getDiscountApplicationId(second.discountApplication)
        )
      );

      return Object.assign({}, lineItem, {
        discountAllocations: sortedDiscountAllocations
      });
    })
    .sort((first, second) => first.id.localeCompare(second.id));
}

export function deepSortDiscountApplications(discountApplications) {
  return discountApplications.sort((first, second) =>
    getDiscountApplicationId(first).localeCompare(getDiscountApplicationId(second))
  );
}
