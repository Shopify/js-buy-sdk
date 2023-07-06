export const secondPageImagesFixture = {
  data: {
    node: {
      __typename: 'Product',
      id: 'gid://shopify/Product/7857989384',
      images: {
        pageInfo: {
          hasNextPage: true,
          hasPreviousPage: false
        },
        edges: [
          {
            cursor: 'eyJsYXN0X2lkIjoxODIxNzc4NzU5Mn0=',
            node: {
              id: 'gid://shopify/ProductImage/16306812680',
              src: 'https://cdn.shopify.com/s/files/1/1510/7238/products/cat2.jpeg?v=1484581332',
              altText: null
            }
          }
        ]
      }
    }
  }
};

export const thirdPageImagesFixture = {
  data: {
    node: {
      __typename: 'Product',
      id: 'gid://shopify/Product/7857989384',
      images: {
        pageInfo: {
          hasNextPage: false,
          hasPreviousPage: false
        },
        edges: [
          {
            cursor: 'eyJsYXN0X2lkIjoxODIxNzc5MDY2NH0=',
            node: {
              id: 'gid://shopify/ProductImage/18217819400',
              src: 'https://cdn.shopify.com/s/files/1/1510/7238/products/cat3.jpeg?v=1484581340',
              altText: null
            }
          }
        ]
      }
    }
  }
};

export const fourthPageImagesFixture = {
  data: {
    node: {
      __typename: 'Product',
      id: 'gid://shopify/Product/8631749576',
      images: {
        pageInfo: {
          hasNextPage: false,
          hasPreviousPage: false
        },
        edges: [
          {
            cursor: 'eyJsYXN0X2lkIjoxODIxNzc4NzU5Mn0=',
            node: {
              id: 'gid://shopify/ProductImage/19892829384',
              src: 'https://cdn.shopify.com/s/files/1/1510/7238/products/cat2.jpeg?v=1484581340',
              altText: null
            }
          }
        ]
      }
    }
  }
};

export const fifthPageImagesFixture = {
  data: {
    node: {
      __typename: 'Product',
      id: 'gid://shopify/Collection/413094472',
      images: {
        pageInfo: {
          hasNextPage: false,
          hasPreviousPage: false
        },
        edges: [
          {
            cursor: 'eyJsYXN0X2lkIjoxOTYxNjczNjg0MH0=',
            node: {
              id: 'gid://shopify/ProductImage/19892783560',
              src: 'https://cdn.shopify.com/s/files/1/1510/7238/products/maxresdefault.jpg?v=1489515047',
              altText: null
            }
          }
        ]
      }
    }
  }
};
