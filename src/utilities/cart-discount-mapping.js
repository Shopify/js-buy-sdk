export function getDiscountAllocationId(discountAllocation) {
  const discountId = discountAllocation.code || discountAllocation.title;

  if (!discountId) {
    throw new Error(
      `Discount allocation must have either code or title: ${JSON.stringify(
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

export function discountMapper({ cartLineItems, cartDiscountAllocations, cartDiscountCodes }) {
  if (
    !cartLineItems.some(({ discountAllocations }) => discountAllocations.length) &&
    !cartDiscountAllocations.length
  ) {
    return {
      discountApplications: [],
      cartLinesWithAllDiscountAllocations: cartLineItems,
    };
  }

  const cartLinesWithAllDiscountAllocations =
    mergeCartOrderLevelDiscountAllocationsToCartLineDiscountAllocations({
      lineItems: cartLineItems,
      orderLevelDiscountAllocationsWithLineIds: findLineIdForEachOrderLevelDiscountAllocation({
        cartLines: cartLineItems,
        orderLevelDiscountAllocations: cartDiscountAllocations
      })
    });

  const discountIdToDiscountApplicationMap = generateDiscountApplications(
    cartLinesWithAllDiscountAllocations,
    cartDiscountCodes
  );

  cartDiscountCodes.forEach(({ code }) => {
    if (!discountIdToDiscountApplicationMap.has(code)) {
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
    cartLinesWithAllDiscountAllocations,
  };
};

function mergeCartOrderLevelDiscountAllocationsToCartLineDiscountAllocations({
  lineItems,
  orderLevelDiscountAllocationsForLines
}) {
  return lineItems.map((line) => {
    const lineItemId = line.id;
    // Could have multiple order-level discount allocations for a given line item
    const orderLevelDiscountAllocationsForLine =
      orderLevelDiscountAllocationsForLines
        .filter(({ id }) => id === lineItemId)
        .map(({ discountAllocation }) => discountAllocation);

    const mergedDiscountAllocations = line.discountAllocations.concat(orderLevelDiscountAllocationsForLine);
    const result = Object.assign({}, line, {
      discountAllocations: mergedDiscountAllocations
    });
    return result;
  });
};

const findLineIdForEachOrderLevelDiscountAllocation = (
  cartLines,
  orderLevelDiscountAllocations
) => {
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
      (a, b) => a.discountedAmount.amount - b.discountedAmount.amount
    );
  });

  // Sort cart line items so that the item with the lowest cost (after line-level discounts) appears first
  const sortedCartLineItems = [...cartLines].sort((a, b) => {
    return a.cost.totalAmount.amount - b.cost.totalAmount.amount;
  });

  // For each discount, the discount allocation with the smallest amount should be applied
  // to the item with the lowest cost (after line-level discounts)
  return Array.from(discountIdToDiscountAllocationsMap.values()).flatMap(
    (allocations) => {
      return sortedCartLineItems.map((lineItem, index) => {
        return {
          id: lineItem.id,
          discountAllocation: allocations[index],
        };
      });
    }
  );
};

function generateDiscountApplications({
  cartLinesWithAllDiscountAllocations,
  discountCodes
}) {
  const discountIdToDiscountApplicationMap = new Map();

  cartLinesWithAllDiscountAllocations.forEach(({ discountAllocations }) => {
    discountAllocations.forEach((discountAllocation) => {
      const discountId = getDiscountAllocationId(discountAllocation);

      if (!discountId) {
        throw new Error(
          `Discount allocation must have either code or title: ${JSON.stringify(
            discountAllocation
          )}`
        );
      }

      if (discountIdToDiscountApplicationMap.has(discountId)) {
        const existingDiscountApplication =
          discountIdToDiscountApplicationMap.get(discountId);
        // if existingDiscountApplication.value is of type MoneyV2 (has an amount field rather than a percentage field)
        if (existingDiscountApplication.value && "amount" in existingDiscountApplication.value) {
          existingDiscountApplication.value.amount +=
            discountAllocation.discountedAmount.amount;
        }
      } else {
        let discountApplication = {
          targetSelection: discountAllocation.targetSelection,
          allocationMethod: discountAllocation.allocationMethod,
          targetType: discountAllocation.targetType,
          value: discountAllocation.value,
        };

        if ("code" in discountAllocation) {
          const discountCode = discountCodes.find(
            ({ code }) => code === discountId
          );

          if (!discountCode) {
            throw new Error(
              `Discount code ${discountId} not found in cart discount codes. Discount codes: ${JSON.stringify(
                discountCodes
              )}`
            );
          }
          discountApplication = Object.assign({}, discountApplication, {
            code: discountAllocation.code,
            applicable: discountCode.applicable,
          });
        } else {
          discountApplication = Object.assign({}, discountApplication, {
            title: discountAllocation.title,
          });
        }

        discountIdToDiscountApplicationMap.set(discountId, discountApplication);
      }
    });
  });

  return discountIdToDiscountApplicationMap;
};

const groupOrderLevelDiscountAllocationsByDiscountId = (cartDiscountAllocations) => {
  return cartDiscountAllocations.reduce((acc, discountAllocation) => {
    const id = getDiscountAllocationId(discountAllocation);
    acc.set(id, [...(acc.get(id) || []), discountAllocation]);
    return acc;
  }, new Map());
};

export const deepSortLines = (lineItems) => {
  return lineItems
    .map((lineItem) => {
      const sortedDiscountAllocations = lineItem.discountAllocations.sort((a, b) =>
        getDiscountApplicationId(a.discountApplication).localeCompare(
          getDiscountApplicationId(b.discountApplication)
        )
      );
      
      return Object.assign({}, lineItem, {
        discountAllocations: sortedDiscountAllocations
      });
    })
    .sort((a, b) => a.id.localeCompare(b.id));
};

export const deepSortDiscountApplications = (discountApplications) => {
  return discountApplications.sort((a, b) =>
    getDiscountApplicationId(a).localeCompare(getDiscountApplicationId(b))
  );
};