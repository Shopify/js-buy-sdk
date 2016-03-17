export const singleCollectionFixture = {
  collection_listing: {
    id: 220591297,
    collection_id: 159064961,
    channel_id: 40889985,
    created_at: '2016-01-05T11:32:26-05:00',
    updated_at: '2016-01-05T11:32:26-05:00',
    body_html: '',
    handle: 'blergh',
    image: null,
    title: 'Blergh.',
    published_at: '2016-01-05T11:32:26-05:00',
    published: true
  }
};

export const multipleCollectionsFixture = {
  collection_listings: [
    singleCollectionFixture.collection_listing,
    {
      id: 220591233,
      collection_id: 157327425,
      channel_id: 40889985,
      created_at: '2016-01-05T11:32:26-05:00',
      updated_at: '2016-01-05T11:32:26-05:00',
      body_html: null,
      handle: 'frontpage',
      image: null,
      title: 'Home page',
      published_at: '2016-01-05T11:32:26-05:00',
      published: true
    }
  ]
};

