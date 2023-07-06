export default {
  data: {
    checkoutShippingAddressUpdateV2: {
      userErrors: [],
      checkoutUserErrors: [],
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
        lineItemsSubtotalPrice: {
          amount: '374.95',
          currencyCode: 'CAD'
        },
        totalPrice: {
          amount: '80.28',
          currencyCode: 'CAD'
        },
        subtotalPrice: {
          amount: '67.5',
          currencyCode: 'CAD'
        },
        totalTax: {
          amount: '8.78',
          currencyCode: 'CAD'
        },
        paymentDue: {
          amount: '80.28',
          currencyCode: 'CAD'
        },
        completedAt: null,
        shippingAddress: {
          id: 'Z2lkOi8vc2hvcGlmeS9NYWlsaW5nQWRkcmVzcy8xMTAyNDgxNzE5MzE4P21vZGVsX25hbWU9QWRkcmVzcw==',
          address1: 'Chestnut Street 92',
          address2: 'Apartment 2',
          city: 'Louisville',
          company: null,
          country: 'United States',
          firstName: 'Bob',
          formatted: [
            'Chestnut Street 92',
            'Apartment 2',
            'Louisville KY 40202',
            'United States'
          ],
          lastName: 'Norman',
          latitude: null,
          longitude: null,
          phone: '555-625-1199',
          province: 'Kentucky',
          zip: '40202',
          name: 'Bob Norman',
          countryCode: 'US',
          provinceCode: 'KY'
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
