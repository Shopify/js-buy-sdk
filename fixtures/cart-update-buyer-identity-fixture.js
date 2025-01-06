export default {
  data: {
    cartBuyerIdentityUpdate: {
      cart: {
        id: 'gid://shopify/Cart/Z2NwLXVzLWVhc3QxOjAxSFA1SlNWOEQ5TUdaTkNaWEZZTk5LRE5T',
        createdAt: '2024-02-09T00:03:13Z',
        updatedAt: '2024-02-09T00:03:14Z',
        lines: {
          pageInfo: {
            hasNextPage: false,
            hasPreviousPage: false
          },
          edges: [
            {
              node: {
                __typename: 'CartLine',
                id: 'gid://shopify/CartLine/c6a616d3-64cc-493d-8328-a92b1215fb4b?cart=Z2NwLXVzLWVhc3QxOjAxSFA1SlNWOEQ5TUdaTkNaWEZZTk5LRE5T',
                merchandise: {
                  id: 'gid://shopify/ProductVariant/13666012889144'
                },
                quantity: 1,
                attributes: [],
                cost: {
                  totalAmount: {
                    amount: '5.15',
                    currencyCode: 'AUD'
                  },
                  subtotalAmount: {
                    amount: '5.15',
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
            amount: '5.09',
            currencyCode: 'AUD'
          },
          subtotalAmount: {
            amount: '5.15',
            currencyCode: 'AUD'
          },
          totalTaxAmount: {
            amount: '0.46',
            currencyCode: 'AUD'
          },
          totalDutyAmount: null
        },
        checkoutUrl: 'https://myshopify.com/cart/c/Z2NwLXVzLWVhc3QxOjAxSFA1SlNWOEQ5TUdaTkNaWEZZTk5LRE5T?key=f031e84cff5ad3935d96d0cc708a97b8',
        discountCodes: [],
        buyerIdentity: {
          countryCode: null,
          preferences: [],
          email: 'hi@hello.com',
          phone: null,
          customer: null,
          deliveryAddressPreferences: []
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
