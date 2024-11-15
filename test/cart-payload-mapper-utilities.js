const typeMap = {
  MoneyV2: {
    name: 'MoneyV2',
    kind: 'OBJECT',
    fieldBaseTypes: {
      amount: 'Decimal',
      currencyCode: 'CurrencyCode'
    },
    implementsNode: false
  }
}

export const withType = (field, type) => {
  field.type = typeMap[type];
  return field;
}