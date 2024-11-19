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

export const MOCK_CHECKOUT_LINE_ITEMS = [
  {
    "id": "gid://shopify/CheckoutLineItem/485358965227740?checkout=43df296f967636ae9f62c0b1fee27775",
    "title": "Alex Kassian - Strings Of Eden",
    "variant": {
      "id": "gid://shopify/ProductVariant/48535896522774",
      "title": "Default Title",
      "price": {
        "amount": "200.0",
        "currencyCode": "USD",
        "type": {
          "name": "MoneyV2",
          "kind": "OBJECT",
          "fieldBaseTypes": {
            "amount": "Decimal",
            "currencyCode": "CurrencyCode"
          },
          "implementsNode": false
        }
      },
      "priceV2": {
        "amount": "200.0",
        "currencyCode": "USD",
        "type": {
          "name": "MoneyV2",
          "kind": "OBJECT",
          "fieldBaseTypes": {
            "amount": "Decimal",
            "currencyCode": "CurrencyCode"
          },
          "implementsNode": false
        }
      },
      "weight": 0,
      "available": true,
      "sku": "",
      "compareAtPrice": {
        "amount": "100.0",
        "currencyCode": "USD",
        "type": {
          "name": "MoneyV2",
          "kind": "OBJECT",
          "fieldBaseTypes": {
            "amount": "Decimal",
            "currencyCode": "CurrencyCode"
          },
          "implementsNode": false
        }
      },
      "compareAtPriceV2": {
        "amount": "100.0",
        "currencyCode": "USD",
        "type": {
          "name": "MoneyV2",
          "kind": "OBJECT",
          "fieldBaseTypes": {
            "amount": "Decimal",
            "currencyCode": "CurrencyCode"
          },
          "implementsNode": false
        }
      },
      "image": {
        "id": "gid://shopify/ProductImage/45559092281366",
        "src": "https://cdn.shopify.com/s/files/1/0601/8783/6438/files/NTMtOTAxNy5qcGVn.jpg?v=1724459712",
        "altText": "pf006_0_Alex Kassian - Strings Of Eden ",
        "width": 500,
        "height": 500,
        "type": {
          "name": "Image",
          "kind": "OBJECT",
          "fieldBaseTypes": {
            "altText": "String",
            "height": "Int",
            "id": "ID",
            "url": "URL",
            "width": "Int"
          },
          "implementsNode": false
        }
      },
      "selectedOptions": [
        {
          "name": "Title",
          "value": "Default Title",
          "type": {
            "name": "SelectedOption",
            "kind": "OBJECT",
            "fieldBaseTypes": {
              "name": "String",
              "value": "String"
            },
            "implementsNode": false
          }
        }
      ],
      "unitPrice": {
        "amount": "400.0",
        "currencyCode": "USD",
        "type": {
          "name": "MoneyV2",
          "kind": "OBJECT",
          "fieldBaseTypes": {
            "amount": "Decimal",
            "currencyCode": "CurrencyCode"
          },
          "implementsNode": false
        }
      },
      "unitPriceMeasurement": {
        "measuredType": null,
        "quantityUnit": null,
        "quantityValue": 0,
        "referenceUnit": null,
        "referenceValue": 0,
        "type": {
          "name": "UnitPriceMeasurement",
          "kind": "OBJECT",
          "fieldBaseTypes": {
            "measuredType": "UnitPriceMeasurementMeasuredType",
            "quantityUnit": "UnitPriceMeasurementMeasuredUnit",
            "quantityValue": "Float",
            "referenceUnit": "UnitPriceMeasurementMeasuredUnit",
            "referenceValue": "Int"
          },
          "implementsNode": false
        }
      },
      "product": {
        "id": "gid://shopify/Product/9899493556246",
        "handle": "alex-kassian-strings-of-eden",
        "type": {
          "name": "Product",
          "kind": "OBJECT",
          "fieldBaseTypes": {
            "availableForSale": "Boolean",
            "createdAt": "DateTime",
            "description": "String",
            "descriptionHtml": "HTML",
            "handle": "String",
            "id": "ID",
            "images": "ImageConnection",
            "onlineStoreUrl": "URL",
            "options": "ProductOption",
            "productType": "String",
            "publishedAt": "DateTime",
            "title": "String",
            "updatedAt": "DateTime",
            "variants": "ProductVariantConnection",
            "vendor": "String"
          },
          "implementsNode": true
        }
      },
      "type": {
        "name": "ProductVariant",
        "kind": "OBJECT",
        "fieldBaseTypes": {
          "availableForSale": "Boolean",
          "compareAtPrice": "MoneyV2",
          "id": "ID",
          "image": "Image",
          "price": "MoneyV2",
          "product": "Product",
          "selectedOptions": "SelectedOption",
          "sku": "String",
          "title": "String",
          "unitPrice": "MoneyV2",
          "unitPriceMeasurement": "UnitPriceMeasurement",
          "weight": "Float"
        },
        "implementsNode": true
      }
    },
    "quantity": 1,
    "customAttributes": [],
    "discountAllocations": [],
    "type": {
      "name": "CheckoutLineItem",
      "kind": "OBJECT",
      "fieldBaseTypes": {
        "customAttributes": "Attribute",
        "discountAllocations": "DiscountAllocation",
        "id": "ID",
        "quantity": "Int",
        "title": "String",
        "variant": "ProductVariant"
      },
      "implementsNode": true
    },
    "hasNextPage": {
      "value": true
    },
    "hasPreviousPage": false,
    "variableValues": {
      "input": {
        "lineItems": [
          {
            "variantId": "gid://shopify/ProductVariant/48535896522774",
            "quantity": 1
          },
          {
            "variantId": "gid://shopify/ProductVariant/48535896555542",
            "quantity": 1
          }
        ]
      }
    }
  },
  {
    "id": "gid://shopify/CheckoutLineItem/485358965555420?checkout=43df296f967636ae9f62c0b1fee27775",
    "title": "Efterklang - Tripper",
    "variant": {
      "id": "gid://shopify/ProductVariant/48535896555542",
      "title": "Default Title",
      "price": {
        "amount": "70.0",
        "currencyCode": "USD",
        "type": {
          "name": "MoneyV2",
          "kind": "OBJECT",
          "fieldBaseTypes": {
            "amount": "Decimal",
            "currencyCode": "CurrencyCode"
          },
          "implementsNode": false
        }
      },
      "priceV2": {
        "amount": "70.0",
        "currencyCode": "USD",
        "type": {
          "name": "MoneyV2",
          "kind": "OBJECT",
          "fieldBaseTypes": {
            "amount": "Decimal",
            "currencyCode": "CurrencyCode"
          },
          "implementsNode": false
        }
      },
      "weight": 460,
      "available": true,
      "sku": "",
      "compareAtPrice": {
        "amount": "70.0",
        "currencyCode": "USD",
        "type": {
          "name": "MoneyV2",
          "kind": "OBJECT",
          "fieldBaseTypes": {
            "amount": "Decimal",
            "currencyCode": "CurrencyCode"
          },
          "implementsNode": false
        }
      },
      "compareAtPriceV2": {
        "amount": "70.0",
        "currencyCode": "USD",
        "type": {
          "name": "MoneyV2",
          "kind": "OBJECT",
          "fieldBaseTypes": {
            "amount": "Decimal",
            "currencyCode": "CurrencyCode"
          },
          "implementsNode": false
        }
      },
      "image": {
        "id": "gid://shopify/ProductImage/45559092609046",
        "src": "https://cdn.shopify.com/s/files/1/0601/8783/6438/files/LTYyNDAuanBlZw.jpg?v=1724460042",
        "altText": "bay40v_0_Efterklang - Tripper",
        "width": 300,
        "height": 300,
        "type": {
          "name": "Image",
          "kind": "OBJECT",
          "fieldBaseTypes": {
            "altText": "String",
            "height": "Int",
            "id": "ID",
            "url": "URL",
            "width": "Int"
          },
          "implementsNode": false
        }
      },
      "selectedOptions": [
        {
          "name": "Title",
          "value": "Default Title",
          "type": {
            "name": "SelectedOption",
            "kind": "OBJECT",
            "fieldBaseTypes": {
              "name": "String",
              "value": "String"
            },
            "implementsNode": false
          }
        }
      ],
      "unitPrice": {
        "amount": "70.0",
        "currencyCode": "USD",
        "type": {
          "name": "MoneyV2",
          "kind": "OBJECT",
          "fieldBaseTypes": {
            "amount": "Decimal",
            "currencyCode": "CurrencyCode"
          },
          "implementsNode": false
        }
      },
      "unitPriceMeasurement": {
        "measuredType": null,
        "quantityUnit": null,
        "quantityValue": 0,
        "referenceUnit": null,
        "referenceValue": 0,
        "type": {
          "name": "UnitPriceMeasurement",
          "kind": "OBJECT",
          "fieldBaseTypes": {
            "measuredType": "UnitPriceMeasurementMeasuredType",
            "quantityUnit": "UnitPriceMeasurementMeasuredUnit",
            "quantityValue": "Float",
            "referenceUnit": "UnitPriceMeasurementMeasuredUnit",
            "referenceValue": "Int"
          },
          "implementsNode": false
        }
      },
      "product": {
        "id": "gid://shopify/Product/9899493589014",
        "handle": "efterklang-tripper",
        "type": {
          "name": "Product",
          "kind": "OBJECT",
          "fieldBaseTypes": {
            "availableForSale": "Boolean",
            "createdAt": "DateTime",
            "description": "String",
            "descriptionHtml": "HTML",
            "handle": "String",
            "id": "ID",
            "images": "ImageConnection",
            "onlineStoreUrl": "URL",
            "options": "ProductOption",
            "productType": "String",
            "publishedAt": "DateTime",
            "title": "String",
            "updatedAt": "DateTime",
            "variants": "ProductVariantConnection",
            "vendor": "String"
          },
          "implementsNode": true
        }
      },
      "type": {
        "name": "ProductVariant",
        "kind": "OBJECT",
        "fieldBaseTypes": {
          "availableForSale": "Boolean",
          "compareAtPrice": "MoneyV2",
          "id": "ID",
          "image": "Image",
          "price": "MoneyV2",
          "product": "Product",
          "selectedOptions": "SelectedOption",
          "sku": "String",
          "title": "String",
          "unitPrice": "MoneyV2",
          "unitPriceMeasurement": "UnitPriceMeasurement",
          "weight": "Float"
        },
        "implementsNode": true
      }
    },
    "quantity": 1,
    "customAttributes": [],
    "discountAllocations": [],
    "type": {
      "name": "CheckoutLineItem",
      "kind": "OBJECT",
      "fieldBaseTypes": {
        "customAttributes": "Attribute",
        "discountAllocations": "DiscountAllocation",
        "id": "ID",
        "quantity": "Int",
        "title": "String",
        "variant": "ProductVariant"
      },
      "implementsNode": true
    },
    "hasNextPage": false,
    "hasPreviousPage": {
      "value": true
    },
    "variableValues": {
      "input": {
        "lineItems": [
          {
            "variantId": "gid://shopify/ProductVariant/48535896522774",
            "quantity": 1
          },
          {
            "variantId": "gid://shopify/ProductVariant/48535896555542",
            "quantity": 1
          }
        ]
      }
    }
  }
];

export const MOCK_CART_LINE_ITEMS = [
  {
    "__typename": "CartLine",
    "id": "gid://shopify/CartLine/1ff7738e-6981-4708-a15f-c3edde1f6c31?cart=Z2NwLXVzLWNlbnRyYWwxOjAxSkQyVjU2UUZKRVhLV003NkoyMFBHR1ZI",
    "merchandise": {
      "id": "gid://shopify/ProductVariant/48535896522774",
      "title": "Default Title",
      "image": {
        "id": "gid://shopify/ProductImage/45559092281366",
        "src": "https://cdn.shopify.com/s/files/1/0601/8783/6438/files/NTMtOTAxNy5qcGVn.jpg?v=1724459712",
        "altText": "pf006_0_Alex Kassian - Strings Of Eden ",
        "width": 500,
        "height": 500,
        "type": {
          "name": "Image",
          "kind": "OBJECT",
          "fieldBaseTypes": {
            "altText": "String",
            "height": "Int",
            "id": "ID",
            "url": "URL",
            "width": "Int"
          },
          "implementsNode": false
        }
      },
      "product": {
        "id": "gid://shopify/Product/9899493556246",
        "handle": "alex-kassian-strings-of-eden",
        "title": "Alex Kassian - Strings Of Eden",
        "type": {
          "name": "Product",
          "kind": "OBJECT",
          "fieldBaseTypes": {
            "availableForSale": "Boolean",
            "createdAt": "DateTime",
            "description": "String",
            "descriptionHtml": "HTML",
            "handle": "String",
            "id": "ID",
            "images": "ImageConnection",
            "onlineStoreUrl": "URL",
            "options": "ProductOption",
            "productType": "String",
            "publishedAt": "DateTime",
            "title": "String",
            "updatedAt": "DateTime",
            "variants": "ProductVariantConnection",
            "vendor": "String"
          },
          "implementsNode": true
        }
      },
      "weight": 0,
      "available": true,
      "sku": "",
      "selectedOptions": [
        {
          "name": "Title",
          "value": "Default Title",
          "type": {
            "name": "SelectedOption",
            "kind": "OBJECT",
            "fieldBaseTypes": {
              "name": "String",
              "value": "String"
            },
            "implementsNode": false
          }
        }
      ],
      "compareAtPrice": {
        "amount": "100.0",
        "currencyCode": "USD",
        "type": {
          "name": "MoneyV2",
          "kind": "OBJECT",
          "fieldBaseTypes": {
            "amount": "Decimal",
            "currencyCode": "CurrencyCode"
          },
          "implementsNode": false
        }
      },
      "unitPrice": {
        "amount": "400.0",
        "currencyCode": "USD",
        "type": {
          "name": "MoneyV2",
          "kind": "OBJECT",
          "fieldBaseTypes": {
            "amount": "Decimal",
            "currencyCode": "CurrencyCode"
          },
          "implementsNode": false
        }
      },
      "price": {
        "amount": "200.0",
        "currencyCode": "USD",
        "type": {
          "name": "MoneyV2",
          "kind": "OBJECT",
          "fieldBaseTypes": {
            "amount": "Decimal",
            "currencyCode": "CurrencyCode"
          },
          "implementsNode": false
        }
      },
      "unitPriceMeasurement": {
        "measuredType": null,
        "quantityUnit": null,
        "quantityValue": 0,
        "referenceUnit": null,
        "referenceValue": 0,
        "type": {
          "name": "UnitPriceMeasurement",
          "kind": "OBJECT",
          "fieldBaseTypes": {
            "measuredType": "UnitPriceMeasurementMeasuredType",
            "quantityUnit": "UnitPriceMeasurementMeasuredUnit",
            "quantityValue": "Float",
            "referenceUnit": "UnitPriceMeasurementMeasuredUnit",
            "referenceValue": "Int"
          },
          "implementsNode": false
        }
      },
      "type": {
        "name": "Merchandise",
        "kind": "UNION"
      }
    },
    "quantity": 1,
    "attributes": [],
    "cost": {
      "totalAmount": {
        "amount": "200.0",
        "currencyCode": "USD",
        "type": {
          "name": "MoneyV2",
          "kind": "OBJECT",
          "fieldBaseTypes": {
            "amount": "Decimal",
            "currencyCode": "CurrencyCode"
          },
          "implementsNode": false
        }
      },
      "subtotalAmount": {
        "amount": "200.0",
        "currencyCode": "USD",
        "type": {
          "name": "MoneyV2",
          "kind": "OBJECT",
          "fieldBaseTypes": {
            "amount": "Decimal",
            "currencyCode": "CurrencyCode"
          },
          "implementsNode": false
        }
      },
      "amountPerQuantity": {
        "amount": "200.0",
        "currencyCode": "USD",
        "type": {
          "name": "MoneyV2",
          "kind": "OBJECT",
          "fieldBaseTypes": {
            "amount": "Decimal",
            "currencyCode": "CurrencyCode"
          },
          "implementsNode": false
        }
      },
      "compareAtAmountPerQuantity": null,
      "type": {
        "name": "CartLineCost",
        "kind": "OBJECT",
        "fieldBaseTypes": {
          "amountPerQuantity": "MoneyV2",
          "compareAtAmountPerQuantity": "MoneyV2",
          "subtotalAmount": "MoneyV2",
          "totalAmount": "MoneyV2"
        },
        "implementsNode": false
      }
    },
    "discountAllocations": [],
    "sellingPlanAllocation": null,
    "type": {
      "name": "CartLine",
      "kind": "OBJECT",
      "fieldBaseTypes": {
        "attributes": "Attribute",
        "cost": "CartLineCost",
        "discountAllocations": "CartDiscountAllocation",
        "id": "ID",
        "merchandise": "Merchandise",
        "quantity": "Int",
        "sellingPlanAllocation": "SellingPlanAllocation"
      },
      "implementsNode": true
    },
    "hasNextPage": false,
    "hasPreviousPage": false,
    "variableValues": {
      "input": {
        "lines": [
          {
            "merchandiseId": "gid://shopify/ProductVariant/48535896522774",
            "quantity": 1
          },
          {
            "merchandiseId": "gid://shopify/ProductVariant/48535896555542",
            "quantity": 1
          }
        ]
      }
    }
  },
  {
    "__typename": "CartLine",
    "id": "gid://shopify/CartLine/194b09cb-98fb-4275-b3bb-a8db42ceaf47?cart=Z2NwLXVzLXdlc3QxOjAxSkJDSEZYMTYzTVE4MDdZTldGOUI1NTBW",
    "merchandise": {
      "id": "gid://shopify/ProductVariant/48535896555542",
      "title": "Default Title",
      "image": {
        "id": "gid://shopify/ProductImage/45559092609046",
        "src": "https://cdn.shopify.com/s/files/1/0601/8783/6438/files/LTYyNDAuanBlZw.jpg?v=1724460042",
        "altText": "bay40v_0_Efterklang - Tripper",
        "width": 300,
        "height": 300,
        "type": {
          "name": "Image",
          "kind": "OBJECT",
          "fieldBaseTypes": {
            "altText": "String",
            "height": "Int",
            "id": "ID",
            "url": "URL",
            "width": "Int"
          },
          "implementsNode": false
        }
      },
      "product": {
        "id": "gid://shopify/Product/9899493589014",
        "handle": "efterklang-tripper",
        "title": "Efterklang - Tripper",
        "type": {
          "name": "Product",
          "kind": "OBJECT",
          "fieldBaseTypes": {
            "availableForSale": "Boolean",
            "createdAt": "DateTime",
            "description": "String",
            "descriptionHtml": "HTML",
            "handle": "String",
            "id": "ID",
            "images": "ImageConnection",
            "onlineStoreUrl": "URL",
            "options": "ProductOption",
            "productType": "String",
            "publishedAt": "DateTime",
            "title": "String",
            "updatedAt": "DateTime",
            "variants": "ProductVariantConnection",
            "vendor": "String"
          },
          "implementsNode": true
        }
      },
      "weight": 460,
      "available": true,
      "sku": "",
      "selectedOptions": [
        {
          "name": "Title",
          "value": "Default Title",
          "type": {
            "name": "SelectedOption",
            "kind": "OBJECT",
            "fieldBaseTypes": {
              "name": "String",
              "value": "String"
            },
            "implementsNode": false
          }
        }
      ],
      "compareAtPrice": {
        "amount": "70.0",
        "currencyCode": "USD",
        "type": {
          "name": "MoneyV2",
          "kind": "OBJECT",
          "fieldBaseTypes": {
            "amount": "Decimal",
            "currencyCode": "CurrencyCode"
          },
          "implementsNode": false
        }
      },
      "unitPrice": {
        "amount": "70.0",
        "currencyCode": "USD",
        "type": {
          "name": "MoneyV2",
          "kind": "OBJECT",
          "fieldBaseTypes": {
            "amount": "Decimal",
            "currencyCode": "CurrencyCode"
          },
          "implementsNode": false
        }
      },
      "price": {
        "amount": "70.0",
        "currencyCode": "USD",
        "type": {
          "name": "MoneyV2",
          "kind": "OBJECT",
          "fieldBaseTypes": {
            "amount": "Decimal",
            "currencyCode": "CurrencyCode"
          },
          "implementsNode": false
        }
      },
      "unitPriceMeasurement": {
        "measuredType": null,
        "quantityUnit": null,
        "quantityValue": 0,
        "referenceUnit": null,
        "referenceValue": 0,
        "type": {
          "name": "UnitPriceMeasurement",
          "kind": "OBJECT",
          "fieldBaseTypes": {
            "measuredType": "UnitPriceMeasurementMeasuredType",
            "quantityUnit": "UnitPriceMeasurementMeasuredUnit",
            "quantityValue": "Float",
            "referenceUnit": "UnitPriceMeasurementMeasuredUnit",
            "referenceValue": "Int"
          },
          "implementsNode": false
        }
      },
      "type": {
        "name": "Merchandise",
        "kind": "UNION"
      }
    },
    "quantity": 1,
    "attributes": [],
    "cost": {
      "totalAmount": {
        "amount": "70.0",
        "currencyCode": "USD",
        "type": {
          "name": "MoneyV2",
          "kind": "OBJECT",
          "fieldBaseTypes": {
            "amount": "Decimal",
            "currencyCode": "CurrencyCode"
          },
          "implementsNode": false
        }
      },
      "subtotalAmount": {
        "amount": "70.0",
        "currencyCode": "USD",
        "type": {
          "name": "MoneyV2",
          "kind": "OBJECT",
          "fieldBaseTypes": {
            "amount": "Decimal",
            "currencyCode": "CurrencyCode"
          },
          "implementsNode": false
        }
      },
      "amountPerQuantity": {
        "amount": "70.0",
        "currencyCode": "USD",
        "type": {
          "name": "MoneyV2",
          "kind": "OBJECT",
          "fieldBaseTypes": {
            "amount": "Decimal",
            "currencyCode": "CurrencyCode"
          },
          "implementsNode": false
        }
      },
      "compareAtAmountPerQuantity": null,
      "type": {
        "name": "CartLineCost",
        "kind": "OBJECT",
        "fieldBaseTypes": {
          "amountPerQuantity": "MoneyV2",
          "compareAtAmountPerQuantity": "MoneyV2",
          "subtotalAmount": "MoneyV2",
          "totalAmount": "MoneyV2"
        },
        "implementsNode": false
      }
    },
    "discountAllocations": [],
    "sellingPlanAllocation": null,
    "type": {
      "name": "CartLine",
      "kind": "OBJECT",
      "fieldBaseTypes": {
        "attributes": "Attribute",
        "cost": "CartLineCost",
        "discountAllocations": "CartDiscountAllocation",
        "id": "ID",
        "merchandise": "Merchandise",
        "quantity": "Int",
        "sellingPlanAllocation": "SellingPlanAllocation"
      },
      "implementsNode": true
    },
    "hasNextPage": false,
    "hasPreviousPage": false,
    "variableValues": {
      "input": {
        "lines": [
          {
            "merchandiseId": "gid://shopify/ProductVariant/48535896522774",
            "quantity": 1
          },
          {
            "merchandiseId": "gid://shopify/ProductVariant/48535896555542",
            "quantity": 1
          }
        ]
      }
    }
  }
];