export const secondPageLineItemsFixture = {
  "data": {
    "node": {
      "__typename": "Checkout",
      "id": "Z2lkOi8vc2hvcGlmeS9DaGVja291dC9lM2JkNzFmNzI0OGM4MDZmMzM3MjVhNTNlMzM5MzFlZj9rZXk9NDcwOTJlNDQ4NTI5MDY4ZDFiZTUyZTUwNTE2MDNhZjg=",
      "lineItems": {
        "pageInfo": {
          "hasNextPage": true,
          "hasPreviousPage": false
        },
        "edges": [
          {
            "cursor": "eyJsYXN0X2lkIjoiZDUyZWU5ZTEwYmQxaM91NDlkNmQzMWNkMzBaJ1m9fkP0==",
            "node": {
              "title": "Cat",
              "variant": {
                "id": "ZNc0vnIOijnJabh4873nNQnfb9B0QhnFyvk9Wfh87oNBeqBHGQNA5a=="
              },
              "quantity": 10,
              "customAttributes": []
            }
          }
        ]
      }
    }
  }
};

export const thirdPageLineItemsFixture = {
  "data": {
    "node": {
      "__typename": "Checkout",
      "id": "Z2lkOi8vc2hvcGlmeS9DaGVja291dC9lM2JkNzFmNzI0OGM4MDZmMzM3MjVhNTNlMzM5MzFlZj9rZXk9NDcwOTJlNDQ4NTI5MDY4ZDFiZTUyZTUwNTE2MDNhZjg=",
      "lineItems": {
        "pageInfo": {
          "hasNextPage": false,
          "hasPreviousPage": false
        },
        "edges": [
          {
            "cursor": "eyJsYXN0X2lkIsfkQ05DUyZWU5ZTEwYmQxaM91NDlkNmQzdJm8QJ1m9fkP0==",
            "node": {
              "title": "Extravagant Tissue Box",
              "variant": {
                "id": "Zad7JHnbf32JHna087juBQn8faB84Ba28VnqjF87Qynaw8MnDhNA3W=="
              },
              "quantity": 15,
              "customAttributes": []
            }
          }
        ]
      }
    }
  }
};
