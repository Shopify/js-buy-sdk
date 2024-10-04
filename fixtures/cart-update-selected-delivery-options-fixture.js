export default {
  data: {
    cartSelectedDeliveryOptionsUpdate: {
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
          edges: [
            {
              node: {
                id: 'gid://shopify/CartDeliveryGroup/269ea2856c41d63937d1ba5212c29713?cart=',
                selectedDeliveryOption: {
                  code: 'Standard',
                  description: '',
                  title: 'Standard'
                },
                deliveryOptions: [
                  {
                    handle: '552e8d727b08fadcf90f688b26bbfe29',
                    title: 'Standard'
                  },
                  {
                    handle: 'aaea08799167c7e60b665b00d7e6894e',
                    title: 'Express'
                  }
                ]
              }
            }
          ]
        },
        note: ''
      },
      userErrors: []
    }
  }
}
