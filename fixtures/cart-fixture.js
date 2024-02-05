export default {
  data: {
    node: {
      __typename: 'Cart',
      attributes: [
        {
          key: 'cart_attribute',
          value: 'This is a cart attribute'
        }
      ],
      checkoutUrl: 'https://myshopify.com/cart/c/Z2NwLWV1cm9wZS13ZXN0NDowMUhOSERHWUNTNDlSMUtQNk1HUjlZOTdDSA?key=73de96370dea19c18996cebea3b31a1b',
      discountCodes: [],
      id: 'gid://shopify/Cart/Z2NwLWV1cm9wZS13ZXN0NDowMUhOSERHWUNTNDlSMUtQNk1HUjlZOTdDSA',
      createdAt: '2024-02-01T04:06:11Z',
      updatedAt: '2024-02-01T04:06:11Z',
      lines: {
        pageInfo: {
          hasNextPage: false,
          hasPreviousPage: false
        },
        edges: [
          {
            node: {
              id: 'gid://shopify/CartLine/a07f5410-ea7a-41ac-a794-839c1e0d599c?cart=Z2NwLWV1cm9wZS13ZXN0NDowMUhOSERHWUNTNDlSMUtQNk1HUjlZOTdDSA',
              merchandise: {
                id: 'gid://shopify/ProductVariant/43162292814051'
              }
            }
          }
        ]
      },
      cost: {
        totalAmount: {
          amount: '0.0',
          currencyCode: 'USD'
        },
        subtotalAmount: {
          amount: '0.0',
          currencyCode: 'USD'
        },
        totalTaxAmount: {
          amount: '0.0',
          currencyCode: 'USD'
        },
        totalDutyAmount: null
      }
    }
  }
}
