export const MOCK_CART_ATTRIBUTES = [{
  key: 'color',
  value: 'blue',
  type: {
    name: 'Attribute',
    kind: 'OBJECT',
    fieldBaseTypes: {
      key: 'String',
      value: 'String'
    },
    implementsNode: false
  }
},
{
  key: 'size',
  value: 'large',
  type: {
    name: 'Attribute',
    kind: 'OBJECT',
    fieldBaseTypes: {
      key: 'String',
      value: 'String'
    },
    implementsNode: false
  }
}
]
export const MOCK_CART_COST = {
  checkoutChargeAmount: {
    amount: 45,
    currencyCode: "USD",
    type: {
      name: 'MoneyV2',
      kind: 'OBJECT',
      fieldBaseTypes: {
        amount: 'Decimal',
        currencyCode: 'CurrencyCode'
      },
      implementsNode: false
    }
  },
  subtotalAmount: {
    amount: 39,
    currencyCode: "USD",
    type: {
      name: 'MoneyV2',
      kind: 'OBJECT',
      fieldBaseTypes: {
        amount: 'Decimal',
        currencyCode: 'CurrencyCode'
      },
      implementsNode: false
    }
  },
  subtotalAmountEstimated: false,
  totalAmount: {
    amount: 317,
    currencyCode: "USD",
    type: {
      name: 'MoneyV2',
      kind: 'OBJECT',
      fieldBaseTypes: {
        amount: 'Decimal',
        currencyCode: 'CurrencyCode'
      },
      implementsNode: false
    }
  },
  totalAmountEstimated: false,
  totalDutyAmount: {
    amount: 10,
    currencyCode: "USD",
    type: {
      name: 'MoneyV2',
      kind: 'OBJECT',
      fieldBaseTypes: {
        amount: 'Decimal',
        currencyCode: 'CurrencyCode'
      },
      implementsNode: false
    }
  },
  totalDutyAmountEstimated: false,
  totalTaxAmount: {
    amount: 15,
    currencyCode: "USD",
    type: {
      name: 'MoneyV2',
      kind: 'OBJECT',
      fieldBaseTypes: {
        amount: 'Decimal',
        currencyCode: 'CurrencyCode'
      },
      implementsNode: false
    }
  },
  totalTaxAmountEstimated: false
}
export const MOCK_DATE = '2017-03-28T16:58:31Z';
export const MOCK_10_CAD_GIFT_CARD = {
  amountUsed: {
    amount: 10,
    currencyCode: "CAD",
    type: {
      name: 'MoneyV2',
      kind: 'OBJECT',
      fieldBaseTypes: {
        amount: 'Decimal',
        currencyCode: 'CurrencyCode'
      },
      implementsNode: false
    }
  },
  amountUsedV2: {
    amount: 10,
    currencyCode: "CAD",
    type: {
      name: 'MoneyV2',
      kind: 'OBJECT',
      fieldBaseTypes: {
        amount: 'Decimal',
        currencyCode: 'CurrencyCode'
      },
      implementsNode: false
    }
  },
  balance: {
    amount: 0,
    currencyCode: "CAD",
    type: {
      name: 'MoneyV2',
      kind: 'OBJECT',
      fieldBaseTypes: {
        amount: 'Decimal',
        currencyCode: 'CurrencyCode'
      },
      implementsNode: false
    }
  },
  balanceV2: {
    amount: 0,
    currencyCode: "CAD",
    type: {
      name: 'MoneyV2',
      kind: 'OBJECT',
      fieldBaseTypes: {
        amount: 'Decimal',
        currencyCode: 'CurrencyCode'
      },
      implementsNode: false
    }
  },
  id: "gid://shopify/AppliedGiftCard/123",
  lastCharacters: "123",
  presentmentAmountUsed: {
    amount: 7.18,
    currencyCode: "USD",
    type: {
      name: 'MoneyV2',
      kind: 'OBJECT',
      fieldBaseTypes: {
        amount: 'Decimal',
        currencyCode: 'CurrencyCode'
      },
      implementsNode: false
    }
  },
  "type": {
    "name": "AppliedGiftCard",
    "kind": "OBJECT",
    "fieldBaseTypes": {
      "amountUsed": "MoneyV2",
      "balance": "MoneyV2",
      "id": "ID",
      "lastCharacters": "String",
      "presentmentAmountUsed": "MoneyV2"
    },
    "implementsNode": true
  }
};
export const MOCK_15_USD_GIFT_CARD = {
  amountUsed: {
    amount: 15,
    currencyCode: "USD",
    type: {
      name: 'MoneyV2',
      kind: 'OBJECT',
      fieldBaseTypes: {
        amount: 'Decimal',
        currencyCode: 'CurrencyCode'
      },
      implementsNode: false
    }
  },
  amountUsedV2: {
    amount: 15,
    currencyCode: "USD",
    type: {
      name: 'MoneyV2',
      kind: 'OBJECT',
      fieldBaseTypes: {
        amount: 'Decimal',
        currencyCode: 'CurrencyCode'
      },
      implementsNode: false
    }
  },
  balance: {
    amount: 0,
    currencyCode: "USD",
    type: {
      name: 'MoneyV2',
      kind: 'OBJECT',
      fieldBaseTypes: {
        amount: 'Decimal',
        currencyCode: 'CurrencyCode'
      },
      implementsNode: false
    }
  },
  balanceV2: {
    amount: 0,
    currencyCode: "USD",
    type: {
      name: 'MoneyV2',
      kind: 'OBJECT',
      fieldBaseTypes: {
        amount: 'Decimal',
        currencyCode: 'CurrencyCode'
      },
      implementsNode: false
    }
  },
  id: "gid://shopify/AppliedGiftCard/456",
  lastCharacters: "456",
  presentmentAmountUsed: {
    amount: 15,
    currencyCode: "USD",
    type: {
      name: 'MoneyV2',
      kind: 'OBJECT',
      fieldBaseTypes: {
        amount: 'Decimal',
        currencyCode: 'CurrencyCode'
      },
      implementsNode: false
    }
  },
  "type": {
    "name": "AppliedGiftCard",
    "kind": "OBJECT",
    "fieldBaseTypes": {
      "amountUsed": "MoneyV2",
      "balance": "MoneyV2",
      "id": "ID",
      "lastCharacters": "String",
      "presentmentAmountUsed": "MoneyV2"
    },
    "implementsNode": true
  }
};