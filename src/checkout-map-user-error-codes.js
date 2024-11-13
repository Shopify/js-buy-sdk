const CartErrorCodeToCheckoutErrorCode = {
  ADDRESS_FIELD_CONTAINS_EMOJIS: 'NOT_SUPPORTED',
  ADDRESS_FIELD_CONTAINS_HTML_TAGS: 'NOT_SUPPORTED',
  ADDRESS_FIELD_CONTAINS_URL: 'NOT_SUPPORTED',
  ADDRESS_FIELD_DOES_NOT_MATCH_EXPECTED_PATTERN: 'NOT_SUPPORTED',
  ADDRESS_FIELD_IS_REQUIRED: 'PRESENT',
  ADDRESS_FIELD_IS_TOO_LONG: 'TOO_LONG',
  INVALID: 'INVALID',
  INVALID_COMPANY_LOCATION: 'INVALID',
  INVALID_DELIVERY_GROUP: 'INVALID',
  INVALID_DELIVERY_OPTION: 'INVALID',
  INVALID_INCREMENT: 'INVALID',
  INVALID_MERCHANDISE_LINE: 'LINE_ITEM_NOT_FOUND',
  INVALID_METAFIELDS: 'INVALID',
  INVALID_PAYMENT: 'INVALID',
  INVALID_PAYMENT_EMPTY_CART: 'INVALID',
  INVALID_ZIP_CODE_FOR_COUNTRY: 'INVALID_FOR_COUNTRY',
  INVALID_ZIP_CODE_FOR_PROVINCE: 'INVALID_FOR_COUNTRY_AND_PROVINCE',
  LESS_THAN: 'LESS_THAN',
  MAXIMUM_EXCEEDED: 'NOT_ENOUGH_IN_STOCK',
  MINIMUM_NOT_MET: 'GREATER_THAN_OR_EQUAL_TO',
  MISSING_CUSTOMER_ACCESS_TOKEN: 'PRESENT',
  MISSING_DISCOUNT_CODE: 'PRESENT',
  MISSING_NOTE: 'PRESENT',
  NOTE_TOO_LONG: 'TOO_LONG',
  PAYMENT_METHOD_NOT_SUPPORTED: 'NOT_SUPPORTED',
  PROVINCE_NOT_FOUND: 'INVALID_PROVINCE_IN_COUNTRY',
  UNSPECIFIED_ADDRESS_ERROR: 'INVALID',
  VALIDATION_CUSTOM: 'INVALID',
  ZIP_CODE_NOT_SUPPORTED: 'NOT_SUPPORTED',
};

const CartWarningCodeToCheckoutErrorCode = {
  MERCHANDISE_NOT_ENOUGH_STOCK: 'NOT_ENOUGH_IN_STOCK',
  MERCHANDISE_OUT_OF_STOCK: 'NOT_ENOUGH_IN_STOCK',
  PAYMENTS_GIFT_CARDS_UNAVAILABLE: 'NOT_SUPPORTED',
};

const userErrorsMapper = (userErrors) => {
  return userErrors.map(({ code, field, message }) => ({
    code: code ? CartErrorCodeToCheckoutErrorCode[code] : undefined,
    field,
    message,
  }));
};

const warningsMapper = (warnings) => {
  return warnings.map(({ code, message }) => ({
    code: code ? CartWarningCodeToCheckoutErrorCode[code] : undefined,
    message,
  }));
};

export default function checkoutUserErrorsMapper(userErrors, warnings) {
  const hasUserErrors = userErrors && userErrors.length;
  const hasWarnings = warnings && warnings.length;

  if (!hasUserErrors && !hasWarnings) {
    return [];
  }

  const checkoutUserErrors = hasUserErrors ? userErrorsMapper(userErrors) : [];
  const checkoutWarnings = hasWarnings ? warningsMapper(warnings) : [];
  return [...checkoutUserErrors, ...checkoutWarnings];
}