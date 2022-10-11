export default {
  data: {
    node: {
      __typename: 'Product',
      id: 'gid://shopify/Collection/369312584',
      handle: 'cat',
      title: 'Cat',
      updatedAt: '2017-01-16T15:42:21Z',
      images: {
        pageInfo: {
          hasNextPage: false,
          hasPreviousPage: false
        },
        edges: [
          {
            cursor: 'eyJsYXN0X2lkIjoxNjMwNjgxMjY4MH0=',
            node: {
              id: 'gid://shopify/ProductImage/16306812680',
              src: 'https://cdn.shopify.com/s/files/1/1510/7238/products/cat.jpg?v=1474839096'
            }
          }
        ]
      },
      options: [
        {
          id: 'gid://shopify/ProductImage/18217790664',
          name: 'Fur'
        }
      ],
      variants: {
        pageInfo: {
          hasNextPage: true,
          hasPreviousPage: false
        },
        edges: [
          {
            cursor: 'eyJsYXN0X2lkIjoyNTYwMjIzNTk3Nn0=',
            node: {
              id: 'gid://shopify/ProductImage/18217819400',
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
