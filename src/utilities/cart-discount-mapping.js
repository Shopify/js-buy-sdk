export function getDiscountAllocationId(discountAllocation) {
  var discountId = discountAllocation.code || discountAllocation.title;

  if (!discountId) {
    throw new Error('Discount allocation must have either code or title: ' + JSON.stringify(discountAllocation));
  }

  return discountId;
}

export function getDiscountApplicationId(discountApplication) {
  var discountId = discountApplication.code || discountApplication.title;

  if (!discountId) {
    throw new Error('Discount application must have either code or title: ' + JSON.stringify(discountApplication));
  }
  return discountId;
}

export function discountMapper(params) {
  var cartLineItems = params.cartLineItems || [];
  var cartDiscountAllocations = params.cartDiscountAllocations || [];
  var cartDiscountCodes = params.cartDiscountCodes || [];

  var hasLineDiscounts = false;
  for (var i = 0; i < cartLineItems.length; i++) {
    if (cartLineItems[i].discountAllocations && cartLineItems[i].discountAllocations.length) {
      hasLineDiscounts = true;
      break;
    }
  }

  if (!hasLineDiscounts && !cartDiscountAllocations.length) {
    return {
      discountApplications: [],
      cartLinesWithAllDiscountAllocations: cartLineItems
    };
  }

  var cartLinesWithAllDiscountAllocations = mergeCartOrderLevelDiscountAllocationsToCartLineDiscountAllocations({
    lineItems: cartLineItems,
    orderLevelDiscountAllocationsWithLineIds: findLineIdForEachOrderLevelDiscountAllocation({
      cartLines: cartLineItems,
      orderLevelDiscountAllocations: cartDiscountAllocations
    })
  });

  var discountIdToDiscountApplicationMap = generateDiscountApplications(
    cartLinesWithAllDiscountAllocations,
    cartDiscountCodes
  );

  // Sanity check
  for (var i = 0; i < cartDiscountCodes.length; i++) {
    var code = cartDiscountCodes[i].code;
    if (!discountIdToDiscountApplicationMap.has(code)) {
      throw new Error(
        'Discount code ' + code + ' not found in discount application map. ' +
        'Discount application map: ' + JSON.stringify(discountIdToDiscountApplicationMap)
      );
    }
  }

  return {
    discountApplications: Array.from(discountIdToDiscountApplicationMap.values()),
    cartLinesWithAllDiscountAllocations: cartLinesWithAllDiscountAllocations
  };
}

function mergeCartOrderLevelDiscountAllocationsToCartLineDiscountAllocations(params) {
  var lineItems = params.lineItems || [];
  var orderLevelDiscountAllocationsWithLineIds = params.orderLevelDiscountAllocationsWithLineIds || [];

  var result = [];
  for (var i = 0; i < lineItems.length; i++) {
    var line = lineItems[i];
    var lineItemId = line.id;
    
    // Could have multiple order-level discount allocations for a given line item
    var orderLevelDiscountAllocationsForLine = [];
    for (var j = 0; j < orderLevelDiscountAllocationsWithLineIds.length; j++) {
      var allocation = orderLevelDiscountAllocationsWithLineIds[j];
      if (allocation.id === lineItemId) {
        orderLevelDiscountAllocationsForLine.push(allocation.discountAllocation);
      }
    }

    var newLine = {};
    for (var key in line) {
      if (line.hasOwnProperty(key)) {
        newLine[key] = line[key];
      }
    }
    newLine.discountAllocations = (line.discountAllocations || []).concat(orderLevelDiscountAllocationsForLine);
    result.push(newLine);
  }

  return result;
}

function findLineIdForEachOrderLevelDiscountAllocation(params) {
  var cartLines = params.cartLines || [];
  var orderLevelDiscountAllocations = params.orderLevelDiscountAllocations || [];

  if (!cartLines.length || !orderLevelDiscountAllocations.length) {
    return [];
  }

  if (orderLevelDiscountAllocations.length % cartLines.length !== 0) {
    throw new Error(
      'Unexpected error: invalid number of order-level discount allocations. For each order-level discount, there must be 1 order-level discount allocation for each line item. ' +
      'Number of line items: ' + cartLines.length + '. Number of discount allocations: ' + orderLevelDiscountAllocations.length
    );
  }

  // Can have multiple order-level discount allocations for a given line item
  var discountIdToDiscountAllocationsMap = new Map();
  for (var i = 0; i < orderLevelDiscountAllocations.length; i++) {
    var discountAllocation = orderLevelDiscountAllocations[i];
    var id = getDiscountAllocationId(discountAllocation);
    var existingAllocations = discountIdToDiscountAllocationsMap.get(id) || [];
    discountIdToDiscountAllocationsMap.set(id, existingAllocations.concat([discountAllocation]));
  }

  // Sort each discount allocation array within the Map by discountedAmount so that the lowest discounted amount appears first
  discountIdToDiscountAllocationsMap.forEach(function(allocations) {
    allocations.sort(function(a, b) {
      return a.discountedAmount.amount - b.discountedAmount.amount;
    });
  });

  // Sort cart line items so that the item with the lowest cost (after line-level discounts) appears first
  var sortedCartLineItems = cartLines.slice().sort(function(a, b) {
    return (a.cost && a.cost.totalAmount ? a.cost.totalAmount.amount : 0) - 
           (b.cost && b.cost.totalAmount ? b.cost.totalAmount.amount : 0);
  });

  // For each discount, the discount allocation with the smallest amount should be applied
  // to the item with the lowest cost (after line-level discounts)
  var result = [];
  var allocationsArray = Array.from(discountIdToDiscountAllocationsMap.values());
  for (var i = 0; i < allocationsArray.length; i++) {
    var allocations = allocationsArray[i];
    for (var j = 0; j < sortedCartLineItems.length; j++) {
      result.push({
        id: sortedCartLineItems[j].id,
        discountAllocation: allocations[j]
      });
    }
  }

  return result;
}

function generateDiscountApplications(cartLinesWithAllDiscountAllocations, discountCodes) {
  var discountIdToDiscountApplicationMap = new Map();

  for (var i = 0; i < cartLinesWithAllDiscountAllocations.length; i++) {
    var line = cartLinesWithAllDiscountAllocations[i];
    var discountAllocations = line.discountAllocations || [];

    for (var j = 0; j < discountAllocations.length; j++) {
      var discountAllocation = discountAllocations[j];
      var discountId = getDiscountAllocationId(discountAllocation);

      if (!discountId) {
        throw new Error(
          'Discount allocation must have either code or title: ' + JSON.stringify(discountAllocation)
        );
      }

      if (discountIdToDiscountApplicationMap.has(discountId)) {
        var existingDiscountApplication = discountIdToDiscountApplicationMap.get(discountId);
        // If existingDiscountApplication.value is a fixed amount rather than a percentage
        if (existingDiscountApplication.value && "amount" in existingDiscountApplication.value) {
          existingDiscountApplication.value.amount += discountAllocation.discountedAmount.amount;
        }
      } else {
        var discountApplication = {
          targetSelection: discountAllocation.targetSelection,
          allocationMethod: discountAllocation.allocationMethod,
          targetType: discountAllocation.targetType,
          value: discountAllocation.value
        };

        if ("code" in discountAllocation) {
          var discountCode = null;
          for (var k = 0; k < discountCodes.length; k++) {
            if (discountCodes[k].code === discountId) {
              discountCode = discountCodes[k];
              break;
            }
          }

          if (!discountCode) {
            throw new Error(
              'Discount code ' + discountId + ' not found in cart discount codes. Discount codes: ' + JSON.stringify(discountCodes)
            );
          }

          var result = {};
          for (var key in discountApplication) {
            if (discountApplication.hasOwnProperty(key)) {
              result[key] = discountApplication[key];
            }
          }
          result.code = discountAllocation.code;
          result.applicable = discountCode.applicable;
          discountApplication = result;
        } else {
          var result = {};
          for (var key in discountApplication) {
            if (discountApplication.hasOwnProperty(key)) {
              result[key] = discountApplication[key];
            }
          }
          result.title = discountAllocation.title;
          discountApplication = result;
        }

        discountIdToDiscountApplicationMap.set(discountId, discountApplication);
      }
    }
  }

  return discountIdToDiscountApplicationMap;
}