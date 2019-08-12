export default {
  "data": {
    "checkoutGiftCardRemoveV2": {
      "checkoutUserErrors": [],
      "userErrors": [],
      "checkout": {
        "id": "Z2lkOi8vc2hvcGlmeS9DaGVja291dC9lM2JkNzFmNzI0OGM4MDZmMzM3MjVhNTNlMzM5MzFlZj9rZXk9NDcwOTJlNDQ4NTI5MDY4ZDFiZTUyZTUwNTE2MDNhZjg=",
        "appliedGiftCards": [],
        "createdAt": "2017-03-17T16:00:40Z",
        "updatedAt": "2017-03-17T16:00:40Z",
        "requiresShipping": true,
        "shippingLine": null,
        "order": null,
        "orderStatusUrl": null,
        "taxExempt": false,
        "taxesIncluded": false,
        "currencyCode": "CAD",
        "totalPrice": "80.28",
        "lineItemsSubtotalPrice": {
          "amount": "74.99",
          "currencyCode": "CAD"
        },
        "subtotalPrice": "67.50",
        "totalTax": "8.78",
        "paymentDue": "80.28",
        "taxExempt": false,
        "taxesIncluded": false,
        "completedAt": null,
        "shippingAddress": {
          "address1": "123 Cat Road",
          "address2": null,
          "city": "Cat Land",
          "company": "Catmart",
          "country": "Canada",
          "firstName": "Meow",
          "formatted": [
            "Catmart",
            "123 Cat Road",
            "Cat Land ON M3O 0W1",
            "Canada"
          ],
          "lastName": "Meowington",
          "latitude": null,
          "longitude": null,
          "phone": "4161234566",
          "province": "Ontario",
          "zip": "M3O 0W1",
          "name": "Meow Meowington",
          "countryCode": "CA",
          "provinceCode": "ON",
          "id": "291dC9lM2JkNzHJnnf8a89njNJNKAhu1gn7lMzM5MzFlZj9rZXk9NDcwOTJ=="
        },
        "lineItems": {
          "pageInfo": {
            "hasNextPage": false,
            "hasPreviousPage": false
          },
          "edges": [
            {
              "cursor": "eyJsYXN0X2lkIjoiZDUyZWU5ZTEwYmQxMWE0NDlkNmQzMWNkMzBhMGFjNzMifQ==",
              "node": {
                "title": "Intelligent Granite Table",
                "variant": {
                  "id": "Z2lkOi8vc2hvcGlmeS9Qcm9kdWN0VmFyaWFudC8yOTEwNjA2NDU4NA==",
                  "price": "74.99"
                },
                "quantity": 5,
                "customAttributes": [],
                "discountAllocations": [
                  {
                    "allocatedAmount": {
                      "amount": "7.49",
                      "currencyCode": "CAD"
                    },
                    "discountApplication": {
                      "targetSelection": "ALL",
                      "allocationMethod": "ACROSS",
                      "targetType": "LINE_ITEM",
                      "code": "TENPERCENTOFF",
                      "applicable": true,
                      "value": {
                        "percentage": "10"
                      }
                    }
                  }
                ]
              }
            }
          ]
        },
        "discountApplications": {
          "pageInfo": {
            "hasNextPage": false,
            "hasPreviousPage": false
          },
          "edges": [
            {
              "node": {
                "targetSelection": "ALL",
                "allocationMethod": "ACROSS",
                "targetType": "LINE_ITEM",
                "code": "TENPERCENTOFF",
                "applicable": true,
                "value": {
                  "percentage": "10"
                }
              }
            }
          ]
        }
      }
    }
  }
};
