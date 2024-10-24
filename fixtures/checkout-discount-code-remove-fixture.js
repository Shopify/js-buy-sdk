export default {
  data: {
    checkoutDiscountCodeRemove: {
      checkoutUserErrors: [],
      userErrors: [],
      checkout: {
        id: 'gid://shopify/Checkout/e3bd71f7248c806f33725a53e33931ef?key=47092e448529068d1be52e5051603af8',
        createdAt: '2017-03-17T16:00:40Z',
        updatedAt: '2017-03-17T16:00:40Z',
        requiresShipping: true,
        shippingLine: null,
        order: null,
        orderStatusUrl: null,
        taxExempt: false,
        taxesIncluded: false,
        currencyCode: 'CAD',
        totalPrice: {
          amount: '88.74',
          currencyCode: 'CAD'
        },
        lineItemsSubtotalPrice: {
          amount: '74.99',
          currencyCode: 'CAD'
        },
        subtotalPrice: {
          amount: '74.99',
          currencyCode: 'CAD'
        },
        totalTax: {
          amount: '9.75',
          currencyCode: 'CAD'
        },
        paymentDue: {
          amount: '88.74',
          currencyCode: 'CAD'
        },
        completedAt: null,
        shippingAddress: {
          address1: '123 Cat Road',
          address2: null,
          city: 'Cat Land',
          company: 'Catmart',
          country: 'Canada',
          firstName: 'Meow',
          formatted: [
            'Catmart',
            '123 Cat Road',
            'Cat Land ON M3O 0W1',
            'Canada'
          ],
          lastName: 'Meowington',
          latitude: null,
          longitude: null,
          phone: '4161234566',
          province: 'Ontario',
          zip: 'M3O 0W1',
          name: 'Meow Meowington',
          countryCode: 'CA',
          provinceCode: 'ON',
          id: '291dC9lM2JkNzHJnnf8a89njNJNKAhu1gn7lMzM5MzFlZj9rZXk9NDcwOTJ=='
        },
        lineItems: {
          pageInfo: {
            hasNextPage: false,
            hasPreviousPage: false
          },
          edges: [
            {
              cursor: 'eyJsYXN0X2lkIjoiZDUyZWU5ZTEwYmQxMWE0NDlkNmQzMWNkMzBhMGFjNzMifQ==',
              node: {
                title: 'Intelligent Granite Table',
                variant: {
                  id: 'gid://shopify/ProductVariant/29106064584',
                  price: {
                    amount: '74.99',
                    currencyCode: 'CAD'
                  }
                },
                quantity: 5,
                customAttributes: [],
                discountAllocations: []
              }
            }
          ]
        }
      }
    }
  }
};
