export default {
  data: {
    node: {
      __typename: 'Product',
      id: 'gid://shopify/Product/7857989384',
      availableForSale: true,
      createdAt: '2016-09-25T21:31:33Z',
      updatedAt: '2017-03-29T15:25:32Z',
      descriptionHtml: 'send me this cat',
      description: 'send me this cat',
      handle: 'cat',
      productType: 'cat',
      title: 'Cat',
      vendor: 'sendmecats',
      publishedAt: '2017-01-12T19:44:42Z',
      options: [
        {
          id: 'gid://shopify/ProductOption/9417004808',
          name: 'Fur',
          values: [
            'Fluffy',
            'Extra Fluffy',
            'Mega Fluff'
          ]
        },
        {
          id: 'gid://shopify/ProductOption/10714078536',
          name: 'Size',
          values: [
            'Medium',
            'Small',
            'Large'
          ]
        }
      ],
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
              src: 'https://cdn.shopify.com/s/files/1/1510/7238/products/cat.jpg?v=1489515038',
              altText: 'fettucine'
            }
          },
          {
            cursor: 'eyJsYXN0X2lkIjoxODIxNzc4NzU5Mn0=',
            node: {
              id: 'gid://shopify/ProductImage/18217787592',
              src: 'https://cdn.shopify.com/s/files/1/1510/7238/products/cat2.jpeg?v=1489515038',
              altText: null
            }
          },
          {
            cursor: 'eyJsYXN0X2lkIjoxODIxNzc5MDY2NH0=',
            node: {
              id: 'gid://shopify/ProductImage/18217790664',
              src: 'https://cdn.shopify.com/s/files/1/1510/7238/products/cat3.jpeg?v=1489515038',
              altText: null
            }
          },
          {
            cursor: 'eyJsYXN0X2lkIjoxOTYxNjczNjg0MH0=',
            node: {
              id: 'gid://shopify/ProductImage/19616736840',
              src: 'https://cdn.shopify.com/s/files/1/1510/7238/products/maxresdefault.jpg?v=1489515047',
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
              id: 'gid://shopify/ProductVariant/25602235976',
              title: 'Fluffy / Medium',
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
              image: {
                id: 'gid://shopify/ProductImage/19616736840',
                src: 'https://cdn.shopify.com/s/files/1/1510/7238/products/maxresdefault.jpg?v=1489515047',
                altText: null
              },
              selectedOptions: [
                {
                  name: 'Fur',
                  value: 'Fluffy'
                },
                {
                  name: 'Size',
                  value: 'Medium'
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
          },
          {
            cursor: 'eyJsYXN0X2lkIjoyNTYwMjIzNjA0MH0=',
            node: {
              id: 'gid://shopify/ProductVariant/25602236040',
              title: 'Extra Fluffy / Small',
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
              image: {
                id: 'gid://shopify/ProductImage/18217787592',
                src: 'https://cdn.shopify.com/s/files/1/1510/7238/products/cat2.jpeg?v=1489515038',
                altText: null
              },
              selectedOptions: [
                {
                  name: 'Fur',
                  value: 'Extra Fluffy'
                },
                {
                  name: 'Size',
                  value: 'Small'
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
          },
          {
            cursor: 'eyJsYXN0X2lkIjoyNTYwMjIzNjEwNH0=',
            node: {
              id: 'gid://shopify/ProductVariant/25602236104',
              title: 'Mega Fluff / Large',
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
              image: {
                id: 'gid://shopify/ProductImage/18217790664',
                src: 'https://cdn.shopify.com/s/files/1/1510/7238/products/cat3.jpeg?v=1489515038',
                altText: null
              },
              selectedOptions: [
                {
                  name: 'Fur',
                  value: 'Mega Fluff'
                },
                {
                  name: 'Size',
                  value: 'Large'
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
