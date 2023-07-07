export const secondPageVariantsFixture = {
  data: {
    node: {
      __typename: 'Product',
      id: 'gid://shopify/Collection/369312584',
      variants: {
        pageInfo: {
          hasNextPage: true,
          hasPreviousPage: false
        },
        edges: [
          {
            cursor: 'eyJsYXN0X2lkIjoyNTYwMjIzNjA0MH0=',
            node: {
              id: 'gid://shopify/ProductImage/18217790664',
              title: 'Extra Fluffy',
              price: {
                amount: '0.0',
                currencyCode: 'CAD'
              },
              priceV2: {
                amount: '0.0',
                currencyCode: 'CAD'
              },
              compareAtPriceV2: {
                amount: '5.0',
                currencyCode: 'CAD'
              },
              weight: 18,
              image: null,
              selectedOptions: [
                {
                  name: 'Fur',
                  value: 'Extra Fluffy'
                }
              ],
              unitPrice: null,
              unitPriceMeasurement: {
                measuredType: null,
                quantityUnit: null,
                quantityValue: 0.0,
                referenceUnit: null,
                referenceValue: 0
              }
            }
          }
        ]
      }
    }
  }
};

export const thirdPageVariantsFixture = {
  data: {
    node: {
      __typename: 'Product',
      id: 'gid://shopify/Collection/369312584',
      variants: {
        pageInfo: {
          hasNextPage: false,
          hasPreviousPage: false
        },
        edges: [
          {
            cursor: 'eyJsYXN0X2lkIjoyNTYwMjIzNjEwNH0=',
            node: {
              id: 'gid://shopify/ProductImage/18217859720',
              title: 'Mega Fluff',
              price: {
                amount: '0.0',
                currencyCode: 'CAD'
              },
              priceV2: {
                amount: '0.0',
                currencyCode: 'CAD'
              },
              compareAtPriceV2: {
                amount: '5.0',
                currencyCode: 'CAD'
              },
              weight: 0,
              image: null,
              selectedOptions: [
                {
                  name: 'Fur',
                  value: 'Mega Fluff'
                }
              ],
              unitPrice: {
                amount: '0.0',
                currencyCode: 'CAD'
              },
              unitPriceMeasurement: {
                measuredType: 'VOLUME',
                quantityUnit: 'ML',
                quantityValue: 5.0,
                referenceUnit: 'ML',
                referenceValue: 1
              }
            }
          }
        ]
      }
    }
  }
};
