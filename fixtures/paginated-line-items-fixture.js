export const secondPageLineItemsFixture = {
  "data": {
    "node": {
      "__typename": "Checkout",
      "id": "gid://shopify/Checkout/e3bd71f7248c806f33725a53e33931ef?key=47092e448529068d1be52e5051603af8",
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
      "id": "gid://shopify/Checkout/e3bd71f7248c806f33725a53e33931ef?key=47092e448529068d1be52e5051603af8",
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
