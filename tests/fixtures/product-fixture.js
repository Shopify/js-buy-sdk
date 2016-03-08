export const singleProductFixture = {
  product_publications: [{
    id: 5123170945,
    product_id: 3677189889,
    channel_id: 40889985,
    created_at: '2016-01-05T11:32:26-05:00',
    updated_at: '2016-01-05T11:32:26-05:00',
    body_html: 'It\'s an aluminum pole. What\'re you expecting?',
    handle: 'aluminum-pole',
    product_type: '',
    title: 'Aluminum Pole',
    vendor: 'buckets-o-stuff',
    published_at: '2016-01-05T11:32:26-05:00',
    published: true,
    available: true,
    tags: '',
    images: [
      {
        id: 7729450433,
        created_at: '2015-12-11T15:45:00-05:00',
        position: 1,
        updated_at: '2015-12-11T15:45:00-05:00',
        product_id: 3677189889,
        src: 'https://cdn.shopify.com/image-one.jpg',
        variant_ids: []
      },
      {
        id: 7776617601,
        created_at: '2015-12-15T13:39:15-05:00',
        position: 2,
        updated_at: '2015-12-15T13:39:15-05:00',
        product_id: 3677189889,
        src: 'https://cdn.shopify.com/image-two.jpg',
        variant_ids: [
          10738392705
        ]
      }
    ],
    options: [
      {
        id: 4442617025,
        name: 'Size',
        product_id: 3677189889,
        position: 1
      },
      {
        id: 4442617089,
        name: 'Enthusiasm',
        product_id: 3677189889,
        position: 2
      }
    ],
    variants: [
      {
        id: 10738392513,
        title: 'Short / Tons',
        option_values: [
          {
            option_id: 4442617025,
            name: 'Size',
            value: 'Short'
          },
          {
            option_id: 4442617089,
            name: 'Enthusiasm',
            value: 'Tons'
          }
        ],
        price: '4.04',
        compare_at_price: null,
        grams: 1000,
        requires_shipping: true,
        sku: '',
        taxable: true,
        position: 1,
        available: true
      },
      {
        id: 10738392577,
        title: 'Short / Less than tons',
        option_values: [
          {
            option_id: 4442617025,
            name: 'Size',
            value: 'Short'
          },
          {
            option_id: 4442617089,
            name: 'Enthusiasm',
            value: 'Less than tons'
          }
        ],
        price: '4.01',
        compare_at_price: null,
        grams: 1000,
        requires_shipping: true,
        sku: '',
        taxable: true,
        position: 2,
        available: true
      },
      {
        id: 10738392641,
        title: 'Long / Tons',
        option_values: [
          {
            option_id: 4442617025,
            name: 'Size',
            value: 'Long'
          },
          {
            option_id: 4442617089,
            name: 'Enthusiasm',
            value: 'Tons'
          }
        ],
        price: '5.12',
        compare_at_price: null,
        grams: 1000,
        requires_shipping: true,
        sku: '',
        taxable: true,
        position: 3,
        available: true
      },
      {
        id: 10738392705,
        title: 'Long / Less than tons',
        option_values: [
          {
            option_id: 4442617025,
            name: 'Size',
            value: 'Long'
          },
          {
            option_id: 4442617089,
            name: 'Enthusiasm',
            value: 'Less than tons'
          }
        ],
        price: '3.00',
        compare_at_price: null,
        grams: 1000,
        requires_shipping: true,
        sku: '',
        taxable: true,
        position: 4,
        available: true
      }
    ]
  }]
};
