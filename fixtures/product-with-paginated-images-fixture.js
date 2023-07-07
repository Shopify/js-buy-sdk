export default {
  data: {
    products: {
      pageInfo: {
        hasNextPage: true,
        hasPreviousPage: false
      },
      edges: [
        {
          cursor: 'eyJsYXN0X2lkIjo3ODU3OTg5Mzg0LCJsYXN0X3ZhbHVlIjoiNzg1Nzk4OTM4NCJ9',
          node: {
            id: 'gid://shopify/Product/7857989384',
            createdAt: '2016-09-25T21:31:33Z',
            updatedAt: '2017-01-16T15:42:21Z',
            descriptionHtml: 'send me this cat',
            description: 'send me this cat',
            handle: 'cat',
            productType: '',
            title: 'Cat',
            vendor: 'sendmecats',
            publishedAt: '2016-09-25T21:29:00Z',
            options: [
              {
                id: 'gid://shopify/ProductImage/19892829384',
                name: 'Fur',
                values: [
                  'Fluffy',
                  'Extra Fluffy',
                  'Mega Fluff'
                ]
              }
            ],
            images: {
              pageInfo: {
                hasNextPage: true,
                hasPreviousPage: false
              },
              edges: [
                {
                  cursor: 'eyJsYXN0X2lkIjoxNjMwNjgxMjY4MH0=',
                  node: {
                    id: 'gid://shopify/ProductImage/19892783560',
                    src: 'https://cdn.shopify.com/s/files/1/1510/7238/products/cat.jpg?v=1474839096',
                    altText: null
                  }
                }
              ]
            },
            variants: {
              pageInfo: {
                hasNextPage: false,
                hasPreviousPage: false
              },
              edges: [
                {
                  cursor: 'eyJsYXN0X2lkIjoyNTYwMjIzNTk3Nn0=',
                  node: {
                    id: 'gid://shopify/ProductImage/18217790664',
                    title: 'Fluffy',
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
                    selectedOptions: [
                      {
                        name: 'Fur',
                        value: 'Fluffy'
                      }
                    ],
                    unitPrice: {
                      amount: '0.00',
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
      ]
    }
  }
};
