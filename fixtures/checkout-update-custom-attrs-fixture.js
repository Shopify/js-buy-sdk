export default {
  data: {
    checkoutAttributesUpdateV2: {
      checkoutUserErrors: [],
      userErrors: [],
      checkout: {
        id: 'gid://shopify/Checkout/t51d71f7248c806f33725a53e33931ef?key=47092e448529068d2ce52e5051603af8',
        ready: true,
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
                  title: 'Awesome Copper Bench',
                  price: {
                    amount: '64.99',
                    currencyCode: 'CAD'
                  },
                  weight: 4.5,
                  image: null,
                  selectedOptions: [
                    {
                      name: 'Color or something',
                      value: 'Awesome Copper Bench'
                    }
                  ]
                },
                quantity: 5,
                customAttributes: []
              }
            }
          ]
        },
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
          id: 'Z2lkOi8vc2hvcGlmeS9QcmdfnAU8nakdWMnAbh890hyOTEwNjA2NDU4NA=='
        },
        shippingLine: null,
        requiresShipping: true,
        customAttributes: [{key: 'MyKey', value: 'MyValue'}],
        note: null,
        paymentDue: {
          amount: '367.19',
          currencyCode: 'CAD'
        },
        webUrl: 'https://checkout.myshopify.io/1/checkouts/c4abf4bf036239ab5e3d0bf93c642c96',
        orderStatusUrl: null,
        taxExempt: false,
        taxesIncluded: false,
        currencyCode: 'CAD',
        totalTax: {
          amount: '42.24',
          currencyCode: 'CAD'
        },
        lineItemsSubtotalPrice: {
          amount: '324.95',
          currencyCode: 'CAD'
        },
        subtotalPrice: {
          amount: '324.95',
          currencyCode: 'CAD'
        },
        totalPrice: {
          amount: '367.19',
          currencyCode: 'CAD'
        },
        completedAt: null,
        createdAt: '2017-03-28T16:58:31Z',
        updatedAt: '2017-03-28T16:58:31Z'
      }
    }
  }
};
