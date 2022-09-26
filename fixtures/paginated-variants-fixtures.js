export const secondPageVariantsFixture = {
  "data": {
    "node": {
      "__typename": "Product",
      "id": "Z2lkOi8vc2hvcGlmeS9Db2xsZWN0aW9uLzM2OTMxMjU4NA==",
      "variants": {
        "pageInfo": {
          "hasNextPage": true,
          "hasPreviousPage": false
        },
        "edges": [
          {
            "cursor": "eyJsYXN0X2lkIjoyNTYwMjIzNjA0MH0=",
            "node": {
              "id": "Z2lkOi8vc2hvcGlmeS9Qcm9kdWN0SW1hZ2UvMTgyMTc3OTA2NjQ=",
              "availableForSale": true,
              "title": "Extra Fluffy",
              "price": "0.00",
              "priceV2": {
                "amount": "0.00",
                "currencyCode": "CAD"
              },
              "compareAtPriceV2": {
                "amount": "5.00",
                "currencyCode": "CAD"
              },
              "weight": 18,
              "image": null,
              "selectedOptions": [
                {
                  "name": "Fur",
                  "value": "Extra Fluffy"
                }
              ],
              "unitPrice": null,
              "unitPriceMeasurement": {
                "measuredType": null,
                "quantityUnit": null,
                "quantityValue": 0.0,
                "referenceUnit": null,
                "referenceValue": 0
              }
            }
          }
        ]
      }
    }
  }
};

export const thirdPageVariantsFixture = {
  "data": {
    "node": {
      "__typename": "Product",
      "id": "Z2lkOi8vc2hvcGlmeS9Db2xsZWN0aW9uLzM2OTMxMjU4NA==",
      "variants": {
        "pageInfo": {
          "hasNextPage": false,
          "hasPreviousPage": false
        },
        "edges": [
          {
            "cursor": "eyJsYXN0X2lkIjoyNTYwMjIzNjEwNH0=",
            "node": {
              "id": "Z2lkOi8vc2hvcGlmeS9Qcm9kdWN0SW1hZ2UvMTgyMTc4NTk3MjA=",
              "availableForSale": true,
              "title": "Mega Fluff",
              "price": "0.00",
              "priceV2": {
                "amount": "0.00",
                "currencyCode": "CAD"
              },
              "compareAtPriceV2": {
                "amount": "5.00",
                "currencyCode": "CAD"
              },
              "weight": 0,
              "image": null,
              "selectedOptions": [
                {
                  "name": "Fur",
                  "value": "Mega Fluff"
                }
              ],
              "unitPrice": {
                "amount": "0.00",
                "currencyCode": "CAD"
              },
              "unitPriceMeasurement": {
                "measuredType": "VOLUME",
                "quantityUnit": "ML",
                "quantityValue": 5.0,
                "referenceUnit": "ML",
                "referenceValue": 1
              }
            }
          }
        ]
      }
    }
  }
};
