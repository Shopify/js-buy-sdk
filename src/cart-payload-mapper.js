import { mapDiscountsAndLines } from "./utilities/cart-mapping-utils";

export function mapCartPayload(cart) {
  if (!cart) return null;

  var result = mapDiscountsAndLines(cart);
  var discountApplications = result.discountApplications;
  var cartLinesWithDiscounts = result.cartLinesWithDiscounts;

  var email = null;
  if (cart.buyerIdentity && cart.buyerIdentity.email) {
    email = cart.buyerIdentity.email;
  }

  var shippingAddress = null;
  if (cart.buyerIdentity && 
      cart.buyerIdentity.deliveryAddressPreferences && 
      cart.buyerIdentity.deliveryAddressPreferences.length) {
    shippingAddress = cart.buyerIdentity.deliveryAddressPreferences[0];
  }

  var currencyCode = null;
  var totalAmount = null;
  var totalTaxAmount = null;
  var totalDutyAmount = null;
  var checkoutChargeAmount = null;

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

  var appliedGiftCards = cart.appliedGiftCards || [];
  var subtotalPrice = null;
  var paymentDue = null;

  if (totalAmount) {
    subtotalPrice = calculateSubtotalPrice(totalAmount, totalDutyAmount, totalTaxAmount);
    paymentDue = calculatePaymentDue(cart, totalAmount);
  }

  return {
    appliedGiftCards: appliedGiftCards,
    completedAt: null,
    createdAt: cart.createdAt,
    currencyCode: currencyCode,
    customAttributes: cart.attributes,
    discountApplications: discountApplications,
    email: email,
    id: cart.id,
    lineItems: cartLinesWithDiscounts,
    lineItemsSubtotalPrice: checkoutChargeAmount,
    note: cart.note,
    order: null,
    orderStatusUrl: null,
    paymentDue: paymentDue,
    paymentDueV2: paymentDue,
    ready: false, // TODO: should we return null instead?
    requiresShipping: null,
    shippingAddress: shippingAddress,
    shippingLine: null,
    subtotalPrice: subtotalPrice,
    subtotalPriceV2: subtotalPrice,
    taxExempt: false,
    taxesIncluded: false,
    totalPrice: totalAmount,
    totalPriceV2: totalAmount,
    totalTax: totalTaxAmount || getDefaultMoneyObject(currencyCode, totalAmount),
    totalTaxV2: totalTaxAmount || getDefaultMoneyObject(currencyCode, totalAmount),
    updatedAt: cart.updatedAt,
    webUrl: cart.checkoutUrl
  };
}

function getDefaultMoneyObject(currencyCode, totalAmount) {
  return {
    amount: 0,
    currencyCode: currencyCode,
    type: totalAmount && totalAmount.type
  };
}

function calculatePaymentDue(cart, totalAmount) {
  if (!cart.appliedGiftCards || !cart.appliedGiftCards.length) {
    return totalAmount;
  }

  // Assuming cart's totalAmount will have the same currency code as gift cards' presentmentAmountUsed
  // TODO - verify this assumption
  var giftCardTotal = 0;
  for (var i = 0; i < cart.appliedGiftCards.length; i++) {
    giftCardTotal += cart.appliedGiftCards[i].presentmentAmountUsed.amount;
  }

  return {
    amount: totalAmount.amount - giftCardTotal,
    currencyCode: totalAmount.currencyCode,
    type: totalAmount.type
  };
}

function calculateSubtotalPrice(totalAmount, totalDutyAmount, totalTaxAmount) {
  var dutyAmount = totalDutyAmount ? totalDutyAmount.amount : 0;
  var taxAmount = totalTaxAmount ? totalTaxAmount.amount : 0;

  return {
    amount: totalAmount.amount - dutyAmount - taxAmount,
    currencyCode: totalAmount.currencyCode,
    type: totalAmount.type
  };
}
