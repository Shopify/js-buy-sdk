import assert from 'assert';
import Client from '../src/client';
import Config from '../src/config';
import productConnectionQuery from '../src/product-connection-query';
import collectionConnectionQuery from '../src/collection-connection-query';
import variantConnectionQuery from '../src/variant-connection-query';
import optionQuery from '../src/option-query';
import imageQuery from '../src/image-query';
import imageConnectionQuery from '../src/image-connection-query';
import collectionNodeQuery from '../src/collection-node-query';
import checkoutQuery from '../src/checkout-query';
import customAttributeQuery from '../src/custom-attribute-query';
import lineItemConnectionQuery from '../src/line-item-connection-query';
import shippingRateQuery from '../src/shipping-rate-query';
import mailingAddressQuery from '../src/mailing-address-query';
import shopQuery from '../src/shop-query';
import shopPolicyQuery from '../src/shop-policy-query';
import domainQuery from '../src/domain-query';

suite('query-test', () => {
  const querySplitter = /[\s,]+/;

  function tokens(query) {
    return query.split(querySplitter).filter((token) => Boolean(token));
  }

  const config = new Config({
    domain: 'sendmecats.myshopify.com',
    storefrontAccessToken: 'abc123'
  });

  const client = new Client(config);

  test('it creates product queries with defaults', () => {
    const defaultQuery = productConnectionQuery();
    const query = client.graphQLClient.query((root) => {
      root.add('shop', (shop) => {
        defaultQuery(shop, 'products');
      });
    });

    const queryString = `query {
      shop {
        products (first: 20) {
          pageInfo {
            hasNextPage,
            hasPreviousPage
          },
          edges {
            cursor,
            node {
              id,
              createdAt,
              updatedAt,
              descriptionHtml,
              description,
              handle,
              productType,
              title,
              onlineStoreUrl,
              vendor,
              tags,
              publishedAt,
              options {
                id,
                name,
                values
              },
              images (first: 250) {
                pageInfo {
                  hasNextPage,
                  hasPreviousPage
                },
                edges {
                  cursor,
                  node {
                    id,
                    src,
                    altText
                  }
                }
              },
              variants (first: 250) {
                pageInfo {
                  hasNextPage,
                  hasPreviousPage
                },
                edges {
                  cursor,
                  node {
                    id,
                    title,
                    price,
                    weight,
                    available,
                    image {
                      id,
                      src,
                      altText
                    },
                    selectedOptions {
                      name,
                      value
                    }
                  }
                }
              }
            }
          }
        }
      }
    }`;

    assert.deepEqual(tokens(query.toString()), tokens(queryString));
  });

  test('it creates product queries with specified fields', () => {
    const customQuery = productConnectionQuery(['id', 'tags', 'vendor', ['images', imageConnectionQuery(['src'])], ['options', optionQuery(['name'])], ['variants', variantConnectionQuery(['id', 'title'])]]);
    const query = client.graphQLClient.query((root) => {
      root.add('shop', (shop) => {
        customQuery(shop, 'products');
      });
    });

    const queryString = `query {
      shop {
        products (first: 20) {
          pageInfo {
            hasNextPage,
            hasPreviousPage
          },
          edges {
            cursor,
            node {
              id,
              tags,
              vendor,
              images (first: 250) {
                pageInfo {
                  hasNextPage,
                  hasPreviousPage
                },
                edges {
                  cursor,
                  node {
                    src
                  }
                }
              },
              options {
                id,
                name
              },
              variants (first: 250) {
                pageInfo {
                  hasNextPage,
                  hasPreviousPage
                },
                edges {
                  cursor,
                  node {
                    id,
                    title
                  }
                }
              }
            }
          }
        }
      }
    }`;

    assert.deepEqual(tokens(query.toString()), tokens(queryString));
  });

  test('it creates collection queries with defaults', () => {
    const defaultQuery = collectionConnectionQuery();
    const query = client.graphQLClient.query((root) => {
      root.add('shop', (shop) => {
        defaultQuery(shop, 'collections');
      });
    });

    const queryString = `query {
      shop {
        collections (first: 20) {
          pageInfo {
            hasNextPage,
            hasPreviousPage
          },
          edges {
            cursor,
            node {
              id,
              handle,
              description,
              descriptionHtml,
              updatedAt,
              title,
              image {
                id,
                src,
                altText
              }
            }
          }
        }
      }
    }`;

    assert.deepEqual(tokens(query.toString()), tokens(queryString));
  });

  test('it creates collection queries with specified fields', () => {
    const customQuery = collectionConnectionQuery(['handle', 'updatedAt', 'title', ['image', imageQuery(['id'])]]);
    const query = client.graphQLClient.query((root) => {
      root.add('shop', (shop) => {
        customQuery(shop, 'collections');
      });
    });


    const queryString = `query {
      shop {
        collections (first: 20) {
          pageInfo {
            hasNextPage,
            hasPreviousPage
          },
          edges {
            cursor,
            node {
              id,
              handle,
              updatedAt,
              title,
              image {
                id
              }
            }
          }
        }
      }
    }`;

    assert.deepEqual(tokens(query.toString()), tokens(queryString));
  });

  test('it can create a nested product connection query', () => {
    const customQuery = collectionNodeQuery([['products', productConnectionQuery()]]);
    const query = client.graphQLClient.query((root) => {
      customQuery(root, 'node', 'Z2lkOi8vc2hvcGlmeS9Qcm9kdWN0SW1hZ2UvMjAxNDMwNDE4NjQ=');
    });

    const queryString = `query {
      node (id: "Z2lkOi8vc2hvcGlmeS9Qcm9kdWN0SW1hZ2UvMjAxNDMwNDE4NjQ=") {
        __typename,
        ... on Collection {
          id,products (first: 20) {
            pageInfo {
              hasNextPage,hasPreviousPage
            },
            edges {
              cursor,
              node {
                id,
                createdAt,
                updatedAt,
                descriptionHtml,
                description,
                handle,
                productType,
                title,
                onlineStoreUrl,
                vendor,
                tags,
                publishedAt,
                options {
                  id,
                  name,
                  values
                },
                images (first: 250) {
                  pageInfo {
                    hasNextPage,
                    hasPreviousPage
                  },
                  edges {
                    cursor,
                    node {
                      id,
                      src,
                      altText
                    }
                  }
                },
                variants (first: 250) {
                  pageInfo {
                    hasNextPage,
                    hasPreviousPage
                  },
                  edges {
                    cursor,
                    node {
                      id,
                      title,
                      price,
                      weight,
                      available,
                      image {
                        id,
                        src,
                        altText
                      },
                      selectedOptions {
                        name,
                        value
                      }
                    }
                  }
                }
              }
            }
          }
        }
      }
    }`;

    assert.deepEqual(tokens(query.toString()), tokens(queryString));
  });

  test('it creates checkout queries (within a mutation) with default fields', () => {
    const defaultQuery = checkoutQuery();
    const input = {
      lineItems: [
        {variantId: 'Z2lkOi8vc2hvcGlmeS9Qcm9kdWN0SW1hZ2UvMjAxNDMwNDE4NjQ=', quantity: 5}
      ]
    };
    const query = client.graphQLClient.mutation((root) => {
      root.add('checkoutCreate', {args: {input}}, (checkoutCreate) => {
        defaultQuery(checkoutCreate, 'checkout');
      });
    });

    const queryString = `mutation {
      checkoutCreate (input: {lineItems: [{variantId: "Z2lkOi8vc2hvcGlmeS9Qcm9kdWN0SW1hZ2UvMjAxNDMwNDE4NjQ=", quantity: 5}]}) {
        checkout {
          id
          ready
          lineItems (first: 250) {
            pageInfo {
              hasNextPage
              hasPreviousPage
            }
            edges {
              cursor
              node {
                id
                title
                variant {
                  id
                  title
                  price
                  weight
                  available
                  image {
                    id
                    src
                    altText
                  }
                  selectedOptions {
                    name
                    value
                  }
                }
                quantity
                customAttributes {
                  key
                  value
                }
              }
            }
          }
          shippingAddress {
            address1
            address2
            city
            company
            country
            firstName
            formatted
            lastName
            latitude
            longitude
            phone
            province
            zip
            name
            countryCode
            provinceCode
            id
          }
          shippingLine {
            handle
            price
            title
          }
          requiresShipping
          customAttributes {
            key
            value
          }
          note
          paymentDue
          webUrl
          order {
            id
            processedAt
            orderNumber
            subtotalPrice
            totalShippingPrice
            totalTax
            totalPrice
            currencyCode
            totalRefunded
            customerUrl
            shippingAddress {
              address1
              address2
              city
              company
              country
              firstName
              formatted
              lastName
              latitude
              longitude
              phone
              province
              zip
              name
              countryCode
              provinceCode
              id
            }
            lineItems (first: 250) {
              pageInfo {
                hasNextPage
                hasPreviousPage
              }
              edges {
                cursor
                node {
                  title
                  variant {
                    id
                    title
                    price
                    weight
                    available
                    image {
                      id
                      src
                      altText
                    }
                    selectedOptions {
                      name
                      value
                    }
                  }
                  quantity
                  customAttributes {
                    key
                    value
                  }
                }
              }
            }
          }
          orderStatusUrl
          taxExempt
          taxesIncluded
          currencyCode
          totalTax
          subtotalPrice
          totalPrice
          completedAt
          createdAt
          updatedAt
        }
      }
    }`;

    assert.deepEqual(tokens(query.toString()), tokens(queryString));
  });

  test('it creates checkout queries (within a mutation) with specified fields', () => {
    const customQuery = checkoutQuery(['id', 'createdAt', ['shippingLine', shippingRateQuery(['price'])],
      ['shippingAddress', mailingAddressQuery(['address1'])],
      ['lineItems', lineItemConnectionQuery(['title', ['customAttributes', customAttributeQuery(['value'])]])]]);
    const input = {
      lineItems: [
        {variantId: 'Z2lkOi8vc2hvcGlmeS9Qcm9kdWN0SW1hZ2UvMjAxNDMwNDE4NjQ=', quantity: 5}
      ]
    };
    const query = client.graphQLClient.mutation((root) => {
      root.add('checkoutCreate', {args: {input}}, (checkoutCreate) => {
        customQuery(checkoutCreate, 'checkout');
      });
    });

    const queryString = `mutation {
      checkoutCreate (input: {lineItems: [{variantId: "Z2lkOi8vc2hvcGlmeS9Qcm9kdWN0SW1hZ2UvMjAxNDMwNDE4NjQ=" quantity: 5}]}) {
        checkout {
          id
          createdAt
          shippingLine {
            price
          }
          shippingAddress {
            id
            address1
          }
          lineItems (first: 250) {
            pageInfo {
              hasNextPage
              hasPreviousPage
            }
            edges {
              cursor
              node {
                id
                title
                customAttributes {
                  value
                }
              }
            }
          }
        }
      }
    }`;

    assert.deepEqual(tokens(query.toString()), tokens(queryString));
  });

  test('it creates shop queries with default fields', () => {
    const defaultQuery = shopQuery();
    const query = client.graphQLClient.query((root) => {
      defaultQuery(root, 'shop');
    });

    const queryString = `query {
      shop {
        currencyCode
        description
        moneyFormat
        name
        primaryDomain {
          host
          sslEnabled
          url
        }
      }
    }`;

    assert.deepEqual(tokens(query.toString()), tokens(queryString));
  });

  test('it creates shop queries with specified fields', () => {
    const customQuery = shopQuery(['name', 'description', ['primaryDomain', domainQuery(['url'])], ['refundPolicy', shopPolicyQuery(['title'])]]);
    const query = client.graphQLClient.query((root) => {
      customQuery(root, 'shop');
    });

    const queryString = `query {
      shop {
        name
        description
        primaryDomain {
          url
        }
        refundPolicy {
          id
          title
        }
      }
    }`;

    assert.deepEqual(tokens(query.toString()), tokens(queryString));
  });
});
