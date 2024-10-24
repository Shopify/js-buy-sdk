export default {
  data: {
    checkoutLineItemsUpdate: {
      userErrors: [],
      checkoutUserErrors: [],
      checkout: {
        id: 'gid://shopify/Checkout/e3bd71f7248c806f33725a53e33931ef?key=47092e448529068d1be52e5051603af8',
        ready: true,
        lineItems: {
          pageInfo: {
            hasNextPage: false,
            hasPreviousPage: false
          },
          edges: [
            {
              cursor: 'eyJsYXN0X2lkIjoiZmI3MTEwMmYwZDM4ZGU0NmUwMzdiMzBmODE3ZTlkYjUifQ==',
              node: {
                id: 'gid://shopify/CheckoutLineItem/194677729198640?checkout=e3bd71f7248c806f33725a53e33931ef',
                title: 'Arena Zip Boot',
                variant: {
                  id: 'gid://shopify/ProductVariant/29106064584',
                  title: 'Black / 8',
                  price: {
                    amount: '188.0',
                    currencyCode: 'CAD'
                  },
                  compareAtPrice: {
                    amount: '190.0',
                    currencyCode: 'CAD'
                  },
                  weight: 0,
                  image: {
                    id: 'gid://shopify/ProductImage/18217790664',
                    src: 'https://cdn.shopify.com/s/files/1/1312/0893/products/003_3e206539-20d3-49c0-8bff-006e449906ca.jpg?v=1491850970',
                    altText: null
                  },
                  selectedOptions: [
                    {
                      name: 'Color',
                      value: 'Black'
                    },
                    {
                      name: 'Size',
                      value: '8'
                    }
                  ]
                },
                quantity: 2,
                customAttributes: [

                ]
              }
            }
          ]
        },
        shippingAddress: null,
        shippingLine: null,
        requiresShipping: true,
        customAttributes: [

        ],
        note: null,
        paymentDue: {
          amount: '376.0',
          currencyCode: 'CAD'
        },
        webUrl: 'https://checkout.shopify.com/13120893/checkouts/e28b55a3205f8d129a9b7223287ec95a?key=191add76e8eba90b93cfe4d5d261c4cb',
        order: null,
        orderStatusUrl: null,
        taxExempt: false,
        taxesIncluded: false,
        currencyCode: 'CAD',
        totalTax: {
          amount: '0.0',
          currencyCode: 'CAD'
        },
        lineItemsSubtotalPrice: {
          amount: '376.0',
          currencyCode: 'CAD'
        },
        subtotalPrice: {
          amount: '376.0',
          currencyCode: 'CAD'
        },
        totalPrice: {
          amount: '376.0',
          currencyCode: 'CAD'
        },
        completedAt: null,
        createdAt: '2017-04-13T21:54:16Z',
        updatedAt: '2017-04-13T21:54:17Z'
      }
    }
  }
};
