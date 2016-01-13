# Buy button SDK prototyping
[![Circle CI](https://circleci.com/gh/Shopify/buy-button-sdk.png?circle-token=ca84774a88598f639b174d498c219163e04adbb2)](https://circleci.com/gh/Shopify/buy-button-sdk)


**NOTE:** Real documentation coming later.

## Run a server:

    $ npm start

## Tests!

Visit http://localhost:4200 with the server running (this is your only real
developer output)

## CLI Tests (CI, or development)

    $ npm test

Or ...

    $ npm run test-ci

For circle

## Build it!

    $ npm build

Your artifacts are in `dist`

# API Examples

## Configuration and initialization

```javascript
SH.init({
  myShopifyDomain: 'my-fancy-shop', // as in my-fancy-shop.myshopify.com
  apiKey: 'abc123def456fffeee777', // found in the buy-button 'integrations' tab
  channelId: '12345', // Also on the integrations tab
});
```

## Fetching products

```javascript
// fetch all products

SH.dataStore.fetchAll('products').then(myProducts => {
  console.log(`I have ${myProducts.length} products in my shop`);

  const firstProduct = myProducts[0];

  console.log('Raw product json', firstProduct.attrs);
  console.log('Computed product values (like localized strings, etc,)', firstProduct);

  myProduct.addToCart(1);
});

// fetch one product

SH.dataStore.fetchOne('products', 12345).then(theProduct => {
  // Do stuff with the product you fetched
});

// fetch products from a query

SH.dataStore.fetchQuery('products', { product_ids: [1, 2, 3] }).then(someProducts => {
  // Do stuff with the products you fetched
});
```

## Working with the data store

The data store is your interface to the remote API, as well as model instantion.
You should never have to do something like `product = new Product`. The data
store takes care of all the heavy lifting. It also retains a reference to
everything you've ever fetched, so you can fetch everything once, up front, and
then peek inside the data store and use those values again later down the road.

```javascript
SH.dataStore.fetchAll('products').then(myProducts => {
  // do some stuff
});

// Do some other stuff. Time passes. Users muck about.

const someProduct = SH.dataStore.peekAll('products').find(product => {
  return product.product_id === 123;
});

someProduct.addToCart();
```

## Working with collections

Collections represent groups of products. A product can exist in multiple
groups, and a collection can contain many products.

```javascript
// fetching a collection
SH.dataStore.fetchQuery('collection', { handle: 'awesome-shirts' }).then(results => {
  const awesomeShirts = results[0];

  // There are two ways to fetch the products for a collection. Both return
  // another promise.
  return awesomeShirts.fetchProducts();
  // OR ...
  return SH.dataStore.fetchQuery('products', { collection_id: awesomeShirts.attrs.id });
}).then(collectionsProducts => {
  // do stuff with your awesome shirts :)
});
```
