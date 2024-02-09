export default {
  data: {
    cartDiscountCodesUpdate: {
      cart: {
        id: 'gid://shopify/Cart/Z2NwLXVzLWVhc3QxOjAxSE5WWTAyVjlETjFDNVowVFZEWVMwMVJR',
        createdAt: '2024-02-09T04:40:26Z',
        updatedAt: '2024-02-09T04:40:28Z',
        lines: {
          pageInfo: {
            hasNextPage: false,
            hasPreviousPage: false
          },
          edges: [
            {
              node: {
                __typename: 'CartLine',
                id: 'gid://shopify/CartLine/22ee49c0-4c8b-424b-bb07-e1a919a17b6b?cart=Z2NwLXVzLWVhc3QxOjAxSFA2Mk5EWDBSUVQzRUgyV1Q1UkI0UURN',
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
        checkoutUrl: 'https://myshopify.com/cart/c/Z2NwLXVzLWVhc3QxOjAxSFA2Mk5EWDBSUVQzRUgyV1Q1UkI0UURN?key=2378e6ae4f4b126e67057648775e56f0',
        discountCodes: [
          {
            applicable: false,
            code: '10OFF'
          }
        ],
        buyerIdentity: {
          countryCode: null,
          walletPreferences: [],
          email: null,
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
