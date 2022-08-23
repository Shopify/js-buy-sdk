export default {
  data: {
    node: {
      __typename: 'Product',
      id: 'gid://shopify/Product/7857989384',
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
          },
          {
            cursor: 'eyJsYXN0X2lkIjoxODIxNzc4NzU5Mn0=',
            node: {
              id: 'gid://shopify/ProductImage/18217787592',
              src: 'https://cdn.shopify.com/s/files/1/1510/7238/products/cat2.jpeg?v=1484581332'
            }
          },
          {
            cursor: 'eyJsYXN0X2lkIjoxODIxNzc5MDY2NH0=',
            node: {
              id: 'gid://shopify/ProductImage/19616736840',
              src: 'https://cdn.shopify.com/s/files/1/1510/7238/products/cat3.jpeg?v=1484581340'
            }
          }
        ]
      },
      options: [
        {
          id: 'gid://shopify/ProductImage/20143041864',
          name: 'Fur'
        }
      ],
      variants: {
        pageInfo: {
          hasNextPage: false,
          hasPreviousPage: false
        },
        edges: [
          {
            cursor: 'eyJsYXN0X2lkIjoyNTYwMjIzNTk3Nn0=',
            node: {
              id: 'gid://shopify/ProductImage/18217859720',
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
          },
          {
            cursor: 'eyJsYXN0X2lkIjoyNTYwMjIzNjA0MH0=',
            node: {
              id: 'gid://shopify/ProductImage/19892783560',
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
          },
          {
            cursor: 'eyJsYXN0X2lkIjoyNTYwMjIzNjEwNH0=',
            node: {
              id: 'gid://shopify/ProductImage/19892829384',
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
