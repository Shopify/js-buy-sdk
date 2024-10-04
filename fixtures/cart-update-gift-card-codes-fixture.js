export default {
  data: {
    cartGiftCardCodesUpdate: {
      cart: {
        id: 'gid://shopify/Cart/Z2NwLXVzLWVhc3QxOjAxSFA2NDFLNUM0NVNZRTU4QVA3V0dQRkRE',
        createdAt: '2024-02-09T05:04:33Z',
        updatedAt: '2024-02-09T05:04:34Z',
        lines: {
          pageInfo: {
            hasNextPage: false,
            hasPreviousPage: false
          },
          edges: [
            {
              node: {
                __typename: 'CartLine',
                id: 'gid://shopify/CartLine/707fa759-932e-4649-b5bb-a4a1c5b1dc22?cart=Z2NwLXVzLWVhc3QxOjAxSFA2NDFLNUM0NVNZRTU4QVA3V0dQRkRE',
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
        checkoutUrl: 'https://myshopify.com/cart/c/Z2NwLXVzLWVhc3QxOjAxSFA2NDFLNUM0NVNZRTU4QVA3V0dQRkRE?key=c546cc21e716cf73d7ef910123b71a1c',
        discountCodes: [],
        buyerIdentity: {
          countryCode: null,
          preferences: [],
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
        note: 'This is a note!',
        appliedGiftCards: [
          {
            id: 'gid://shopify/AppliedGiftCard/a62ffb64-7ae6-4179-a4b8-f3aaa84ae433',
            amountUsed: {
              amount: '5.09',
              currencyCode: 'AUD'
            },
            balance: {
              amount: '4.91'
            },
            lastCharacters: 'q379',
            presentmentAmountUsed: {
              amount: '5.09',
              currencyCode: 'AUD'
            }
          }
        ]
      },
      userErrors: []
    }
  }
}
