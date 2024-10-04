export default {
  data: {
    cartAttributesUpdate: {
      cart: {
        id: 'gid://shopify/Cart/Z2NwLXVzLWVhc3QxOjAxSE5WWTAyVjlETjFDNVowVFZEWVMwMVJR',
        createdAt: '2024-02-05T06:06:28Z',
        updatedAt: '2024-02-05T06:06:29Z',
        lines: {
          pageInfo: {
            hasNextPage: false,
            hasPreviousPage: false
          },
          edges: [
            {
              node: {
                __typename: 'CartLine',
                id: 'gid://shopify/CartLine/a0e2dc6a-31e7-43da-8228-9bea1785cf52?cart=Z2NwLXVzLWVhc3QxOjAxSE5WWTAyVjlETjFDNVowVFZEWVMwMVJR',
                merchandise: {
                  id: 'gid://shopify/ProductVariant/13666012889144'
                }
              }
            }
          ]
        },
        attributes: [
          {
            key: 'hey',
            value: 'hi'
          }
        ],
        cost: {
          totalAmount: {
            amount: '25.49',
            currencyCode: 'AUD'
          },
          subtotalAmount: {
            amount: '25.75',
            currencyCode: 'AUD'
          },
          totalTaxAmount: {
            amount: '2.32',
            currencyCode: 'AUD'
          },
          totalDutyAmount: null
        },
        checkoutUrl: 'https://myshopify.com/cart/c/Z2NwLXVzLWVhc3QxOjAxSE5WWTAyVjlETjFDNVowVFZEWVMwMVJR?key=40fb6cc506a25f4c6a35b784e0454185',
        discountCodes: [],
        buyerIdentity: {
          countryCode: null,
          preferences: [],
          email: null,
          phone: null,
          customer: null
        }
      },
      userErrors: []
    }
  }
};
