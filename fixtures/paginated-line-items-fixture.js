export const secondPageLineItemsFixture = {
  "data": {
    "node": {
      "__typename": "Checkout",
      "id": "gid://shopify/Checkout/89427726abd2543894550baae32065d6",
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
                "id": "gid://shopify/ProductVariant/2"
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
      "id": "gid://shopify/Checkout/89427726abd2543894550baae32065d6",
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
                "id": "gid://shopify/ProductVariant/3"
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
