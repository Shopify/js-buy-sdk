> [!WARNING]
> The Checkout API is now [deprecated](https://github.com/Shopify/storefront-api-feedback/discussions/225). Use the Cart API via the [Storefront API Client](https://github.com/Shopify/shopify-app-js/tree/main/packages/api-clients/storefront-api-client#readme) instead.

## Checkouts

### Creating a Checkout

```javascript
// Create an empty checkout
client.checkout.create().then((checkout) => {
  // Do something with the checkout
  console.log(checkout);
});
```

### Updating checkout attributes

```javascript
const checkoutId = 'gid://shopify/Checkout/e3bd71f7248c806f33725a53e33931ef?key=47092e448529068d1be52e5051603af8';
const input = {customAttributes: [{key: "MyKey", value: "MyValue"}]};

client.checkout.updateAttributes(checkoutId, input).then((checkout) => {
  // Do something with the updated checkout
});
```

### Adding Line Items

```javascript
const checkoutId = 'gid://shopify/Checkout/e3bd71f7248c806f33725a53e33931ef?key=47092e448529068d1be52e5051603af8'; // ID of an existing checkout
const lineItemsToAdd = [
  {
    variantId: 'gid://shopify/ProductVariant/29106064584',
    quantity: 5,
    customAttributes: [{key: "MyKey", value: "MyValue"}]
  }
];

// Add an item to the checkout
client.checkout.addLineItems(checkoutId, lineItemsToAdd).then((checkout) => {
  // Do something with the updated checkout
  console.log(checkout.lineItems); // Array with one additional line item
});
```

### Updating Line Items

```javascript
const checkoutId = 'gid://shopify/Checkout/e3bd71f7248c806f33725a53e33931ef?key=47092e448529068d1be52e5051603af8'; // ID of an existing checkout
const lineItemsToUpdate = [
  {id: 'gid://shopify/CheckoutLineItem/194677729198640?checkout=e3bd71f7248c806f33725a53e33931ef', quantity: 2}
];

// Update the line item on the checkout (change the quantity or variant)
client.checkout.updateLineItems(checkoutId, lineItemsToUpdate).then((checkout) => {
  // Do something with the updated checkout
  console.log(checkout.lineItems); // Quantity of line item 'gid://shopify/Product/7857989384' updated to 2
});
```

### Removing Line Items

```javascript
const checkoutId = 'gid://shopify/Checkout/e3bd71f7248c806f33725a53e33931ef?key=47092e448529068d1be52e5051603af8'; // ID of an existing checkout
const lineItemIdsToRemove = [
  'gid://shopify/CheckoutLineItem/194677729198640?checkout=e3bd71f7248c806f33725a53e33931ef'
];

// Remove an item from the checkout
client.checkout.removeLineItems(checkoutId, lineItemIdsToRemove).then((checkout) => {
  // Do something with the updated checkout
  console.log(checkout.lineItems); // Checkout with line item 'gid://shopify/CheckoutLineItem/194677729198640?checkout=e3bd71f7248c806f33725a53e33931ef' removed
});
```

### Fetching a Checkout

```javascript
const checkoutId = 'gid://shopify/Checkout/e3bd71f7248c806f33725a53e33931ef?key=47092e448529068d1be52e5051603af8'

client.checkout.fetch(checkoutId).then((checkout) => {
  // Do something with the checkout
  console.log(checkout);
});
```

### Adding a Discount

```javascript
const checkoutId = 'gid://shopify/Checkout/e3bd71f7248c806f33725a53e33931ef?key=47092e448529068d1be52e5051603af8'; // ID of an existing checkout
const discountCode = 'best-discount-ever';

// Add a discount code to the checkout
client.checkout.addDiscount(checkoutId, discountCode).then(checkout => {
  // Do something with the updated checkout
  console.log(checkout);
});
```

### Removing a Discount

```javascript
const checkoutId = 'gid://shopify/Checkout/e3bd71f7248c806f33725a53e33931ef?key=47092e448529068d1be52e5051603af8'; // ID of an existing checkout

// Removes the applied discount from an existing checkout.
client.checkout.removeDiscount(checkoutId).then(checkout => {
  // Do something with the updated checkout
  console.log(checkout);
});
```

### Updating a Shipping Address

```javascript
const checkoutId = 'gid://shopify/Checkout/e3bd71f7248c806f33725a53e33931ef?key=47092e448529068d1be52e5051603af8'; // ID of an existing checkout

const shippingAddress = {
   address1: 'Chestnut Street 92',
   address2: 'Apartment 2',
   city: 'Louisville',
   company: null,
   country: 'United States',
   firstName: 'Bob',
   lastName: 'Norman',
   phone: '555-625-1199',
   province: 'Kentucky',
   zip: '40202'
 };

// Update the shipping address for an existing checkout.
client.checkout.updateShippingAddress(checkoutId, shippingAddress).then(checkout => {
  // Do something with the updated checkout
});
```

### Completing a checkout

The simplest way to complete a checkout is to use the [webUrl](https://help.shopify.com/en/api/storefront-api/reference/object/checkout) property that is returned when creating a checkout. This URL redirects the customer to Shopify's [online checkout](https://help.shopify.com/en/manual/checkout-settings) to complete the purchase.
