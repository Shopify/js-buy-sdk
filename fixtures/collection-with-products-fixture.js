export default {
  data: {
    node: {
      __typename: 'Collection',
      id: 'gid://shopify/Collection/369312584',
      handle: 'frontpage',
      description: '',
      descriptionHtml: '',
      updatedAt: '2017-03-29T15:30:02Z',
      title: 'Cat Collection',
      image: null,
      products: {
        pageInfo: {
          hasNextPage: false,
          hasPreviousPage: false
        },
        edges: [
          {
            cursor: 'eyJsYXN0X2lkIjo3ODU3OTg5Mzg0LCJsYXN0X3ZhbHVlIjoiNzg1Nzk4OTM4NCJ9',
            node: {
              id: 'gid://shopify/Product/7857989384',
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
          },
          {
            cursor: 'eyJsYXN0X2lkIjo4NjMxNzQ5NTc2LCJsYXN0X3ZhbHVlIjoiODYzMTc0OTU3NiJ9',
            node: {
              id: 'gid://shopify/Product/8631749576',
              createdAt: '2017-02-03T18:52:27Z',
              updatedAt: '2017-03-30T18:27:00Z',
              descriptionHtml: 'alternative cat',
              description: 'alternative cat',
              handle: 'cat-2',
              productType: 'cat',
              title: 'Cat 2',
              vendor: 'sendmecats',
              publishedAt: '2017-02-03T18:52:27Z',
              options: [
                {
                  id: 'gid://shopify/ProductOption/10373760392',
                  name: 'Title',
                  values: [
                    'Default Title'
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
                    cursor: 'eyJsYXN0X2lkIjoyMDE0MzA0MTg2NH0=',
                    node: {
                      id: 'gid://shopify/ProductImage/20143041864',
                      src: 'https://cdn.shopify.com/s/files/1/1510/7238/products/image.dots.morethings.jpg?v=1490898420',
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
                    cursor: 'eyJsYXN0X2lkIjoyOTkzNzExMjEzNn0=',
                    node: {
                      id: 'gid://shopify/ProductVariant/29937112136',
                      title: 'Default Title',
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
                          name: 'Title',
                          value: 'Default Title'
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
        ]
      }
    }
  }
};
