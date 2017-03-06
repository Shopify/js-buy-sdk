export const secondPageVariantsFixture = {
  "data": {
    "node": {
      "__typename": "Product",
      "id": "gid://shopify/Product/7857989384",
      "variants": {
        "pageInfo": {
          "hasNextPage": true,
          "hasPreviousPage": false
        },
        "edges": [
          {
            "cursor": "eyJsYXN0X2lkIjoyNTYwMjIzNjA0MH0=",
            "node": {
              "id": "gid://shopify/ProductVariant/25602236040",
              "title": "Extra Fluffy",
              "price": "0.00",
              "weight": 18,
              "selectedOptions": [
                {
                  "name": "Fur",
                  "value": "Extra Fluffy"
                }
              ]
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
      "id": "gid://shopify/Product/7857989384",
      "variants": {
        "pageInfo": {
          "hasNextPage": false,
          "hasPreviousPage": false
        },
        "edges": [
          {
            "cursor": "eyJsYXN0X2lkIjoyNTYwMjIzNjEwNH0=",
            "node": {
              "id": "gid://shopify/ProductVariant/25602236104",
              "title": "Mega Fluff",
              "price": "0.00",
              "weight": 0,
              "selectedOptions": [
                {
                  "name": "Fur",
                  "value": "Mega Fluff"
                }
              ]
            }
          }
        ]
      }
    }
  }
};

export const emptyPageVariantsFixture = {
  "data": {
    "node": {
      "__typename": "Product",
      "id": "gid://shopify/Product/7857989384",
      "variants": {
        "pageInfo": {
          "hasNextPage": false,
          "hasPreviousPage": false
        },
        "edges": []
      }
    }
  }
};
