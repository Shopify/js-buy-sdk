import {mapDiscountsAndLines} from './utilities/cart-mapping-utils';

// NOTE: fields such as availableShippingRates are not included because they are not queried by the JS Buy SDK
const UNSUPPORTED_FIELDS = {
  completedAt: null,
  order: null,
  orderStatusUrl: null,
  ready: false,
  requiresShipping: true,
  shippingLine: null,
  taxExempt: false,
  taxesIncluded: false
};

export function mapCartPayload(cart) {
  if (!cart) { return null; }

  const result = mapDiscountsAndLines(cart);
  const discountApplications = result.discountApplications;
  const cartLinesWithDiscounts = result.cartLinesWithDiscounts;

  const buyerIdentity = {
    countryCode: cart.buyerIdentity && cart.buyerIdentity.countryCode
  };

  let email = null;

  if (cart.buyerIdentity && cart.buyerIdentity.email) {
    email = cart.buyerIdentity.email;
  }

  let shippingAddress = null;

  if (cart.buyerIdentity &&
    cart.buyerIdentity.deliveryAddressPreferences &&
    cart.buyerIdentity.deliveryAddressPreferences.length) {
    shippingAddress = cart.buyerIdentity.deliveryAddressPreferences[0];
  }

  let currencyCode = null;
  let totalAmount = null;
  let totalTaxAmount = null;
  let totalDutyAmount = null;
  let checkoutChargeAmount = null;

  if (cart.cost) {
    if (cart.cost.totalAmount) {
      currencyCode = cart.cost.totalAmount.currencyCode;
      totalAmount = cart.cost.totalAmount;
    }
    if (cart.cost.totalTaxAmount) {
      totalTaxAmount = cart.cost.totalTaxAmount;
    }
    if (cart.cost.totalDutyAmount) {
      totalDutyAmount = cart.cost.totalDutyAmount;
    }
    if (cart.cost.checkoutChargeAmount) {
      checkoutChargeAmount = cart.cost.checkoutChargeAmount;
    }
  }

  const appliedGiftCards = cart.appliedGiftCards || [];
  let totalPrice = null;

  // This field will be defined in the API, but we're making it "optional" here so that our
  // unit tests for other fields work while only passing in the relevant fields
  if (totalAmount) {
    totalPrice = calculateTotalPrice(cart, totalAmount);
  }

  let subtotalPrice = null;

  // This field will be defined in the API, but we're making it "optional" here so that our
  // unit tests for other fields work while only passing in the relevant fields
  if (totalPrice) {
    subtotalPrice = calculateSubtotalPrice(totalPrice, totalDutyAmount, totalTaxAmount);
  }

  const checkoutPayload = Object.assign({
    appliedGiftCards,
    buyerIdentity,
    createdAt: cart.createdAt,
    currencyCode,
    customAttributes: cart.attributes,
    discountApplications,
    email,
    id: cart.id,
    lineItems: cartLinesWithDiscounts,
    lineItemsSubtotalPrice: checkoutChargeAmount,
    note: cart.note,
    paymentDue: totalAmount,
    paymentDueV2: totalAmount,
    shippingAddress,
    subtotalPrice,
    subtotalPriceV2: subtotalPrice,
    totalPrice,
    totalPriceV2: totalPrice,
    totalTax: totalTaxAmount || getDefaultMoneyObject(currencyCode, totalAmount),
    totalTaxV2: totalTaxAmount || getDefaultMoneyObject(currencyCode, totalAmount),
    updatedAt: cart.updatedAt,
    webUrl: cart.checkoutUrl
  }, UNSUPPORTED_FIELDS);

  normalizeCartMoneyFieldDecimalPlaces(checkoutPayload);

  return checkoutPayload;
}

/**
 *
 * @description Normalize all currency fields in the checkout payload to contain
 * the same number of decimal places that would be returned by the storefront API.
 *
 * In the storefront API, currency amounts are returned as a string that contains
 * 1 decimal place (if the 2nd decimal place is 0) or else 2 decimal places.
 *
 * In our mapping functions, we are typically converting to strings with 2 decimal
 * places. In case any clients of the JS Buy SDK are relying only a single decimal
 * place being returned in some cases, we want to normalize the decimal places.
 */
function normalizeCartMoneyFieldDecimalPlaces(checkout) {
  // The fields that we have mapped the currency for (that we therefore need to normalize)
  // are: discountApplication amounts, subtotalPrice, and totalPrice.

  if (checkout.discountApplications) {
    for (let i = 0; i < checkout.discountApplications.length; i++) {
      if (typeof checkout.discountApplications[i].value.percentage !== 'undefined') {
        continue;
      }

      const discountApplicationAmount = checkout.discountApplications[i].value.amount.toString();

      if (!shouldReturnWithOneDecimalPlace(discountApplicationAmount)) {
        continue;
      }

      checkout.discountApplications[i].value.amount = convertToOneDecimalPlace(discountApplicationAmount);
    }
  }

  if (checkout.lineItems) {
    for (let i = 0; i < checkout.lineItems.length; i++) {
      for (let j = 0; j < checkout.lineItems[i].discountAllocations.length; j++) {
        const discountApplication = checkout.lineItems[i].discountAllocations[j].discountApplication;

        if (typeof discountApplication.value.percentage !== 'undefined') {
          continue;
        }

        const discountApplicationAmount = discountApplication.value.amount.toString();

        if (!shouldReturnWithOneDecimalPlace(discountApplicationAmount)) {
          continue;
        }

        discountApplication.value.amount = convertToOneDecimalPlace(discountApplicationAmount);
      }
    }
  }

  if (checkout.subtotalPrice) {
    if (shouldReturnWithOneDecimalPlace(checkout.subtotalPrice.amount)) {
      checkout.subtotalPrice.amount = convertToOneDecimalPlace(checkout.subtotalPrice.amount);
      checkout.subtotalPriceV2.amount = convertToOneDecimalPlace(checkout.subtotalPriceV2.amount);
    }
  }

  if (checkout.totalPrice) {
    if (shouldReturnWithOneDecimalPlace(checkout.totalPrice.amount)) {
      checkout.totalPrice.amount = convertToOneDecimalPlace(checkout.totalPrice.amount);
      checkout.totalPriceV2.amount = convertToOneDecimalPlace(checkout.totalPriceV2.amount);
    }
  }
}

/**
 * @description Whether the SF API would return this amount with 1 decimal place
 * (as opposed to 2 decimal places). See normalizeCartMoneyFieldDecimalPlaces
 * for more information.
 * @param {string} currency field to check
 * @returns {boolean} whether the SF API would return this amount with 1 decimal place
 */
function shouldReturnWithOneDecimalPlace(amount) {
  if (!amount || !amount.toString().includes('.')) {
    return false;
  }

  const currencyDecimals = amount.toString().split('.')[1];

  if (currencyDecimals.length === 2 && currencyDecimals[1] === '0') {
    return true;
  }

  return false;
}

function convertToOneDecimalPlace(stringAmount) {
  return parseFloat(stringAmount).toFixed(1);
}

function getDefaultMoneyObject(currencyCode, totalAmount) {
  return {
    amount: '0.0',
    currencyCode,
    type: totalAmount && totalAmount.type
  };
}

function calculateTotalPrice(cart, totalAmount) {
  if (!cart.appliedGiftCards || !cart.appliedGiftCards.length) {
    return totalAmount;
  }

  // Assuming cart's totalAmount will have the same currency code as gift cards' presentmentAmountUsed
  let giftCardTotal = 0;

  for (let i = 0; i < cart.appliedGiftCards.length; i++) {
    giftCardTotal += parseFloat(cart.appliedGiftCards[i].presentmentAmountUsed.amount);
  }

  return {
    amount: (parseFloat(totalAmount.amount) - giftCardTotal).toFixed(2),
    currencyCode: totalAmount.currencyCode,
    type: totalAmount.type
  };
}

function calculateSubtotalPrice(totalPrice, totalDutyAmount, totalTaxAmount) {
  const dutyAmount = totalDutyAmount ? totalDutyAmount.amount : 0;
  const taxAmount = totalTaxAmount ? totalTaxAmount.amount : 0;

  return {
    amount: (parseFloat(totalPrice.amount) - parseFloat(dutyAmount) - parseFloat(taxAmount)).toFixed(2),
    currencyCode: totalPrice.currencyCode,
    type: totalPrice.type
  };
}
