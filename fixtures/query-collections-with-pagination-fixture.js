export default {
  data: {
    collections: {
      pageInfo: {
        hasNextPage: false,
        hasPreviousPage: false
      },
      edges: [
        {
          cursor: 'eyJsYXN0X2lkIjozNjkzMTI1ODQsImxhc3RfdmFsdWUiOiIzNjkzMTI1ODQifQ==',
          node: {
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
                        hasNextPage: true,
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
                        hasNextPage: true,
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
        },
        {
          cursor: 'eyJsYXN0X2lkIjo0MTMwOTQ0NzIsImxhc3RfdmFsdWUiOiI0MTMwOTQ0NzIifQ==',
          node: {
            id: 'gid://shopify/Collection/413094472',
            handle: 'test',
            description: '',
            descriptionHtml: '',
            updatedAt: '2017-03-29T15:30:02Z',
            title: 'Test',
            image: null,
            products: {
              pageInfo: {
                hasNextPage: false,
                hasPreviousPage: false
              },
              edges: [
                {
                  cursor: 'eyJsYXN0X2lkIjo4NTMwMDMzNTQ0LCJsYXN0X3ZhbHVlIjoiODUzMDAzMzU0NCJ9',
                  node: {
                    id: 'gid://shopify/Product/8530033544',
                    createdAt: '2017-01-16T15:43:38Z',
                    updatedAt: '2017-04-06T17:30:25Z',
                    descriptionHtml: 'do not send',
                    description: 'do not send',
                    handle: 'not-cat',
                    productType: 'really not cat',
                    title: 'Not Cat',
                    vendor: 'sendmecats',
                    publishedAt: '2017-01-16T15:43:38Z',
                    options: [
                      {
                        id: 'gid://shopify/ProductOption/10244315208',
                        name: 'Size',
                        values: [
                          'small',
                          'large',
                          'very large'
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
                          cursor: 'eyJsYXN0X2lkIjoxODIxNzgxOTQwMH0=',
                          node: {
                            id: 'gid://shopify/ProductImage/18217819400',
                            src: 'https://cdn.shopify.com/s/files/1/1510/7238/products/notcat.jpeg?v=1490363658',
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
                          cursor: 'eyJsYXN0X2lkIjoyOTEwNjAyMjc5Mn0=',
                          node: {
                            id: 'gid://shopify/ProductVariant/29106022792',
                            title: 'small',
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
                              id: 'gid://shopify/ProductImage/19892783560',
                              src: 'https://cdn.shopify.com/s/files/1/1510/7238/products/054cca77f1be90654f4f70db263a3822.jpg?v=1490363658',
                              altText: null
                            },
                            selectedOptions: [
                              {
                                name: 'Size',
                                value: 'small'
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
                          cursor: 'eyJsYXN0X2lkIjoyOTEwNjA2NDU4NH0=',
                          node: {
                            id: 'gid://shopify/ProductVariant/29106064584',
                            title: 'large',
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
                              id: 'gid://shopify/ProductImage/18217859720',
                              src: 'https://cdn.shopify.com/s/files/1/1510/7238/products/23695_pets_vertical_store_dogs_small_tile_8._CB312176604.jpg?v=1490363658',
                              altText: null
                            },
                            selectedOptions: [
                              {
                                name: 'Size',
                                value: 'large'
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
                          cursor: 'eyJsYXN0X2lkIjoyOTEwNjA2NDY0OH0=',
                          node: {
                            id: 'gid://shopify/ProductVariant/29106064648',
                            title: 'very large',
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
                              id: 'gid://shopify/ProductImage/19892829384',
                              src: 'https://cdn.shopify.com/s/files/1/1510/7238/products/original.jpg?v=1490363713',
                              altText: null
                            },
                            selectedOptions: [
                              {
                                name: 'Size',
                                value: 'very large'
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
      ]
    }
  }
};
