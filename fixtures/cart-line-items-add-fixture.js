export default {
  data: {
    cartLinesAdd: {
      cart: {
        id: 'gid://shopify/Cart/Z2NwLXVzLWVhc3QxOjAxSFA1UFBYVE1ZTkRBVkFHMlNIQ1RENE0y',
        createdAt: '2024-02-09T01:11:32Z',
        updatedAt: '2024-02-09T01:11:33Z',
        lines: {
          pageInfo: {
            hasNextPage: false,
            hasPreviousPage: false
          },
          edges: [
            {
              node: {
                __typename: 'CartLine',
                id: 'gid://shopify/CartLine/ff20f2b0-a16f-4127-8f5c-3ae00596fcb9?cart=Z2NwLXVzLWVhc3QxOjAxSFA1UFBYVE1ZTkRBVkFHMlNIQ1RENE0y',
                merchandise: {
                  id: 'gid://shopify/ProductVariant/13666012889144'
                },
                quantity: 2,
                attributes: [],
                cost: {
                  totalAmount: {
                    amount: '10.3',
                    currencyCode: 'AUD'
                  },
                  subtotalAmount: {
                    amount: '10.3',
                    currencyCode: 'AUD'
                  },
                  amountPerQuantity: {
                    amount: '5.15',
                    currencyCode: 'AUD'
                  },
                  compareAtAmountPerQuantity: null
                },
                discountAllocations: [],
                sellingPlanAllocation: null
              }
            }
          ]
        },
        attributes: [],
        cost: {
          totalAmount: {
            amount: '10.2',
            currencyCode: 'AUD'
          },
          subtotalAmount: {
            amount: '10.3',
            currencyCode: 'AUD'
          },
          totalTaxAmount: {
            amount: '0.93',
            currencyCode: 'AUD'
          },
          totalDutyAmount: null
        },
        checkoutUrl: 'https://myshopify.com/cart/c/Z2NwLXVzLWVhc3QxOjAxSFA1UFBYVE1ZTkRBVkFHMlNIQ1RENE0y?key=239090a4dea9c74475cd0b63d8561d39',
        discountCodes: [],
        buyerIdentity: {
          countryCode: null,
          walletPreferences: [],
          email: null,
          phone: null,
          customer: null
        },
        deliveryGroups: {
          pageInfo: {
            hasNextPage: false,
            hasPreviousPage: false
          },
          edges: []
        },
        note: ''
      },
      userErrors: []
    }
  }
}
