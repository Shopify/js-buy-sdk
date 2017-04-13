## Classes

<dl>
<dt><a href="#Client">Client</a></dt>
<dd><p>The JS Buy SDK Client.</p>
</dd>
<dt><a href="#Config">Config</a></dt>
<dd><p>The class used to configure the JS Buy SDK Client.</p>
</dd>
</dl>

<a name="Client"></a>

## Client
The JS Buy SDK Client.

**Kind**: global class  

* [Client](#Client)
    * [new Client(config)](#new_Client_new)
    * _instance_
        * [.fetchShopInfo([query])](#Client+fetchShopInfo) ⇒ <code>Promise</code> \| <code>GraphModel</code>
        * [.fetchShopPolicies([query])](#Client+fetchShopPolicies) ⇒ <code>Promise</code> \| <code>GraphModel</code>
        * [.fetchAllProducts([query])](#Client+fetchAllProducts) ⇒ <code>Promise</code> \| <code>Array.&lt;GraphModel&gt;</code>
        * [.fetchProduct(id, [query])](#Client+fetchProduct) ⇒ <code>Promise</code> \| <code>GraphModel</code>
        * [.fetchAllCollections([query])](#Client+fetchAllCollections) ⇒ <code>Promise</code> \| <code>Array.&lt;GraphModel&gt;</code>
        * [.fetchAllCollectionsWithProducts()](#Client+fetchAllCollectionsWithProducts) ⇒ <code>Promise</code> \| <code>Array.&lt;GraphModel&gt;</code>
        * [.fetchCollection(id, [query])](#Client+fetchCollection) ⇒ <code>Promise</code> \| <code>GraphModel</code>
        * [.fetchCollectionWithProducts(id)](#Client+fetchCollectionWithProducts) ⇒ <code>Promise</code> \| <code>GraphModel</code>
        * [.fetchCheckout(id, [query])](#Client+fetchCheckout) ⇒ <code>Promise</code> \| <code>GraphModel</code>
        * [.fetchQueryProducts([queryObject], [query])](#Client+fetchQueryProducts) ⇒ <code>Promise</code> \| <code>Array.&lt;GraphModel&gt;</code>
        * [.fetchQueryCollections([queryObject], [query])](#Client+fetchQueryCollections) ⇒ <code>Promise</code> \| <code>Array.&lt;GraphModel&gt;</code>
        * [.createCheckout([input], [query])](#Client+createCheckout) ⇒ <code>Promise</code> \| <code>GraphModel</code>
        * [.addLineItems(checkoutId, lineItems, [query])](#Client+addLineItems) ⇒ <code>Promise</code> \| <code>GraphModel</code>
        * [.removeLineItems(checkoutId, lineItemIds, [query])](#Client+removeLineItems) ⇒ <code>Promise</code> \| <code>GraphModel</code>
        * [.updateLineItems(checkoutId, lineItems, [query])](#Client+updateLineItems) ⇒ <code>Promise</code> \| <code>GraphModel</code>
    * _static_
        * [.Product](#Client.Product) : <code>object</code>
            * [.Helpers](#Client.Product.Helpers) : <code>object</code>
                * [.variantForOptions(product, options)](#Client.Product.Helpers.variantForOptions) ⇒ <code>GraphModel</code>
        * [.Image](#Client.Image) : <code>object</code>
            * [.Helpers](#Client.Image.Helpers) : <code>object</code>
                * [.imageForSize(image, options)](#Client.Image.Helpers.imageForSize) ⇒ <code>String</code>
        * [.Queries](#Client.Queries) : <code>object</code>
            * [.checkoutQuery([fields])](#Client.Queries.checkoutQuery)
            * [.checkoutNodeQuery([fields])](#Client.Queries.checkoutNodeQuery)
            * [.collectionConnectionQuery([fields])](#Client.Queries.collectionConnectionQuery)
            * [.collectionNodeQuery([fields])](#Client.Queries.collectionNodeQuery)
            * [.customAttributeQuery([fields])](#Client.Queries.customAttributeQuery)
            * [.domainQuery([fields])](#Client.Queries.domainQuery)
            * [.imageConnectionQuery([fields])](#Client.Queries.imageConnectionQuery)
            * [.imageQuery([fields])](#Client.Queries.imageQuery)
            * [.lineItemConnectionQuery([fields])](#Client.Queries.lineItemConnectionQuery)
            * [.mailingAddressQuery([fields])](#Client.Queries.mailingAddressQuery)
            * [.optionQuery([fields])](#Client.Queries.optionQuery)
            * [.orderQuery([fields])](#Client.Queries.orderQuery)
            * [.productConnectionQuery([fields])](#Client.Queries.productConnectionQuery)
            * [.productNodeQuery([fields])](#Client.Queries.productNodeQuery)
            * [.selectedOptionQuery([fields])](#Client.Queries.selectedOptionQuery)
            * [.shippingRateQuery([fields])](#Client.Queries.shippingRateQuery)
            * [.shopPolicyQuery([fields])](#Client.Queries.shopPolicyQuery)
            * [.variantConnectionQuery([fields])](#Client.Queries.variantConnectionQuery)
            * [.variantQuery([fields])](#Client.Queries.variantQuery)

<a name="new_Client_new"></a>

### new Client(config)

| Param | Type | Description |
| --- | --- | --- |
| config | <code>[Config](#Config)</code> | An instance of [Config](#Config) used to configure the Client. |

<a name="Client+fetchShopInfo"></a>

### client.fetchShopInfo([query]) ⇒ <code>Promise</code> \| <code>GraphModel</code>
Fetches shop information (e.g. name, description).

**Kind**: instance method of <code>[Client](#Client)</code>  
**Returns**: <code>Promise</code> \| <code>GraphModel</code> - A promise resolving with a `GraphModel` of the shop.  

| Param | Type | Description |
| --- | --- | --- |
| [query] | <code>Client.Queries.shopQuery</code> | Callback function to specify fields to query on the shop. |

**Example**  
```js
client.fetchShopInfo().then((shop) => {
  // Do something with the shop
});
```
<a name="Client+fetchShopPolicies"></a>

### client.fetchShopPolicies([query]) ⇒ <code>Promise</code> \| <code>GraphModel</code>
Fetches shop policies.

**Kind**: instance method of <code>[Client](#Client)</code>  
**Returns**: <code>Promise</code> \| <code>GraphModel</code> - A promise resolving with a `GraphModel` of the shop.  

| Param | Type | Description |
| --- | --- | --- |
| [query] | <code>Client.Queries.shopQuery</code> | Callback function to specify fields to query on the shop. |

**Example**  
```js
client.fetchShopPolicies().then((shop) => {
  // Do something with the shop
});
```
<a name="Client+fetchAllProducts"></a>

### client.fetchAllProducts([query]) ⇒ <code>Promise</code> \| <code>Array.&lt;GraphModel&gt;</code>
Fetches all products on the shop.

**Kind**: instance method of <code>[Client](#Client)</code>  
**Returns**: <code>Promise</code> \| <code>Array.&lt;GraphModel&gt;</code> - A promise resolving with an array of `GraphModel`s of the products.  

| Param | Type | Description |
| --- | --- | --- |
| [query] | <code>[productConnectionQuery](#Client.Queries.productConnectionQuery)</code> | Callback function to specify fields to query on the products. |

**Example**  
```js
client.fetchAllProducts().then((products) => {
  // Do something with the products
});
```
<a name="Client+fetchProduct"></a>

### client.fetchProduct(id, [query]) ⇒ <code>Promise</code> \| <code>GraphModel</code>
Fetches a single product by ID on the shop.

**Kind**: instance method of <code>[Client](#Client)</code>  
**Returns**: <code>Promise</code> \| <code>GraphModel</code> - A promise resolving with a `GraphModel` of the product.  

| Param | Type | Description |
| --- | --- | --- |
| id | <code>String</code> | The id of the product to fetch. |
| [query] | <code>[productNodeQuery](#Client.Queries.productNodeQuery)</code> | Callback function to specify fields to query on the product. |

**Example**  
```js
client.fetchProduct('123456').then((product) => {
  // Do something with the product
});
```
<a name="Client+fetchAllCollections"></a>

### client.fetchAllCollections([query]) ⇒ <code>Promise</code> \| <code>Array.&lt;GraphModel&gt;</code>
Fetches all collections on the shop, not including products.
To fetch collections with products use [fetchAllCollectionsWithProducts](#Client+fetchAllCollectionsWithProducts).

**Kind**: instance method of <code>[Client](#Client)</code>  
**Returns**: <code>Promise</code> \| <code>Array.&lt;GraphModel&gt;</code> - A promise resolving with an array of `GraphModel`s of the collections.  

| Param | Type | Description |
| --- | --- | --- |
| [query] | <code>[collectionConnectionQuery](#Client.Queries.collectionConnectionQuery)</code> | Callback function to specify fields to query on the collections. |

**Example**  
```js
client.fetchAllCollections().then((collections) => {
  // Do something with the collections
});
```
<a name="Client+fetchAllCollectionsWithProducts"></a>

### client.fetchAllCollectionsWithProducts() ⇒ <code>Promise</code> \| <code>Array.&lt;GraphModel&gt;</code>
Fetches all collections on the shop, including products.

**Kind**: instance method of <code>[Client](#Client)</code>  
**Returns**: <code>Promise</code> \| <code>Array.&lt;GraphModel&gt;</code> - A promise resolving with an array of `GraphModel`s of the collections.  
**Example**  
```js
client.fetchAllCollectionsWithProducts().then((collections) => {
  // Do something with the collections
});
```
<a name="Client+fetchCollection"></a>

### client.fetchCollection(id, [query]) ⇒ <code>Promise</code> \| <code>GraphModel</code>
Fetches a single collection by ID on the shop, not including products.
To fetch the collection with products use [fetchCollectionWithProducts](#Client+fetchCollectionWithProducts).

**Kind**: instance method of <code>[Client](#Client)</code>  
**Returns**: <code>Promise</code> \| <code>GraphModel</code> - A promise resolving with a `GraphModel` of the collection.  

| Param | Type | Description |
| --- | --- | --- |
| id | <code>String</code> | The id of the collection to fetch. |
| [query] | <code>[collectionNodeQuery](#Client.Queries.collectionNodeQuery)</code> | Callback function to specify fields to query on the collection. |

**Example**  
```js
client.fetchCollection('123456').then((collection) => {
  // Do something with the collection
});
```
<a name="Client+fetchCollectionWithProducts"></a>

### client.fetchCollectionWithProducts(id) ⇒ <code>Promise</code> \| <code>GraphModel</code>
Fetches a single collection by ID on the shop, including products.

**Kind**: instance method of <code>[Client](#Client)</code>  
**Returns**: <code>Promise</code> \| <code>GraphModel</code> - A promise resolving with a `GraphModel` of the collection.  

| Param | Type | Description |
| --- | --- | --- |
| id | <code>String</code> | The id of the collection to fetch. |

**Example**  
```js
client.fetchCollectionWithProducts('123456').then((collection) => {
  // Do something with the collection
});
```
<a name="Client+fetchCheckout"></a>

### client.fetchCheckout(id, [query]) ⇒ <code>Promise</code> \| <code>GraphModel</code>
Fetches a checkout by ID.

**Kind**: instance method of <code>[Client](#Client)</code>  
**Returns**: <code>Promise</code> \| <code>GraphModel</code> - A promise resolving with a `GraphModel` of the checkout.  

| Param | Type | Description |
| --- | --- | --- |
| id | <code>String</code> | The id of the checkout to fetch. |
| [query] | <code>[checkoutNodeQuery](#Client.Queries.checkoutNodeQuery)</code> | Callback function to specify fields to query on the checkout. |

**Example**  
```js
client.fetchCheckout('123456').then((checkout) => {
  // Do something with the checkout
});
```
<a name="Client+fetchQueryProducts"></a>

### client.fetchQueryProducts([queryObject], [query]) ⇒ <code>Promise</code> \| <code>Array.&lt;GraphModel&gt;</code>
Fetches all products on the shop that match the query.

**Kind**: instance method of <code>[Client](#Client)</code>  
**Returns**: <code>Promise</code> \| <code>Array.&lt;GraphModel&gt;</code> - A promise resolving with an array of `GraphModel`s of the products.  

| Param | Type | Description |
| --- | --- | --- |
| [queryObject] | <code>Object</code> | An object specifying the query data containing zero or more of: |
| [queryObject.title] | <code>String</code> | The title of the product to fetch. |
| [queryObject.updatedAtMin] | <code>String</code> | Products updated since the supplied timestamp (format: `2016-09-25T21:31:33`). |
| [queryObject.createdAtMin] | <code>String</code> | Products created since the supplied timestamp (format: `2016-09-25T21:31:33`). |
| [queryObject.productType] | <code>String</code> | The type of products to fetch. |
| [queryObject.limit] | <code>Number</code> | The number of products to fetch. |
| [queryObject.sortBy] | <code>String</code> | The field to use to sort products. Possible values are `title`, `updatedAt`, and `createdAt`. |
| [queryObject.sortDirection] | <code>String</code> | The sort direction of the products.     Will sort products by ascending order unless `'desc'` is specified. |
| [query] | <code>[productConnectionQuery](#Client.Queries.productConnectionQuery)</code> | Callback function to specify fields to query on the products. |

**Example**  
```js
client.fetchQueryProducts({sortBy: 'title', limit: 10}).then((products) => {
  // Do something with the first 10 products sorted by title in ascending order
});
```
<a name="Client+fetchQueryCollections"></a>

### client.fetchQueryCollections([queryObject], [query]) ⇒ <code>Promise</code> \| <code>Array.&lt;GraphModel&gt;</code>
Fetches all collections on the shop that match the query.

**Kind**: instance method of <code>[Client](#Client)</code>  
**Returns**: <code>Promise</code> \| <code>Array.&lt;GraphModel&gt;</code> - A promise resolving with an array of `GraphModel`s of the collections.  

| Param | Type | Description |
| --- | --- | --- |
| [queryObject] | <code>Object</code> | An object specifying the query data containing zero or more of: |
| [queryObject.title] | <code>String</code> | The title of the collection to fetch. |
| [queryObject.updatedAtMin] | <code>String</code> | Collections updated since the supplied timestamp (format: `2016-09-25T21:31:33`). |
| [queryObject.limit] | <code>Number</code> | The number of collections to fetch. |
| [queryObject.sortBy] | <code>String</code> | The field to use to sort collections. Possible values are `title` and `updatedAt`. |
| [queryObject.sortDirection] | <code>String</code> | The sort direction of the collections.     Will sort collections by ascending order unless `'desc'` is specified. |
| [query] | <code>[collectionConnectionQuery](#Client.Queries.collectionConnectionQuery)</code> | Callback function to specify fields to query on the collections. |

**Example**  
```js
client.fetchQueryCollections({sortBy: 'title', limit: 10}).then((collections) => {
  // Do something with the first 10 collections sorted by title in ascending order
});
```
<a name="Client+createCheckout"></a>

### client.createCheckout([input], [query]) ⇒ <code>Promise</code> \| <code>GraphModel</code>
Creates a checkout.

**Kind**: instance method of <code>[Client](#Client)</code>  
**Returns**: <code>Promise</code> \| <code>GraphModel</code> - A promise resolving with the created checkout.  

| Param | Type | Description |
| --- | --- | --- |
| [input] | <code>Object</code> | An input object containing zero or more of: |
| [input.email] | <code>String</code> | An email connected to the checkout. |
| [input.lineItems] | <code>Array.&lt;Object&gt;</code> | A list of line items in the checkout. See the [Storefront API reference](https://help.shopify.com/api/storefront-api/reference/input_object/checkoutlineiteminput) for valid input fields for each line item. |
| [input.shippingAddress] | <code>Object</code> | A shipping address. See the [Storefront API reference](https://help.shopify.com/api/storefront-api/reference/input_object/mailingaddressinput) for valid input fields. |
| [input.note] | <code>String</code> | A note for the checkout. |
| [input.customAttributes] | <code>Array.&lt;Object&gt;</code> | A list of custom attributes for the checkout. See the [Storefront API reference](https://help.shopify.com/api/storefront-api/reference/input_object/attributeinput) for valid input fields. |
| [query] | <code>[checkoutQuery](#Client.Queries.checkoutQuery)</code> | Callback function to specify fields to query on the checkout returned. |

**Example**  
```js
const input = {
  lineItems: [
    {variantId: 'gid://shopify/ProductVariant/2', quantity: 5}
  ]
};

client.createCheckout(input).then((checkout) => {
  // Do something with the newly created checkout
});
```
<a name="Client+addLineItems"></a>

### client.addLineItems(checkoutId, lineItems, [query]) ⇒ <code>Promise</code> \| <code>GraphModel</code>
Adds line items to an existing checkout.

**Kind**: instance method of <code>[Client](#Client)</code>  
**Returns**: <code>Promise</code> \| <code>GraphModel</code> - A promise resolving with the updated checkout.  

| Param | Type | Description |
| --- | --- | --- |
| checkoutId | <code>String</code> | The ID of the checkout to add line items to. |
| lineItems | <code>Array.&lt;Object&gt;</code> | A list of line items to add to the checkout. See the [Storefront API reference](https://help.shopify.com/api/storefront-api/reference/input_object/checkoutlineiteminput) for valid input fields for each line item. |
| [query] | <code>[checkoutQuery](#Client.Queries.checkoutQuery)</code> | Callback function to specify fields to query on the checkout returned. |

**Example**  
```js
const checkoutId = 'gid://shopify/Checkout/abc123';
const lineItems = [{variantId: 'gid://shopify/ProductVariant/2', quantity: 5}];

client.addLineItems(checkoutId, lineItems).then((checkout) => {
  // Do something with the updated checkout
});
```
<a name="Client+removeLineItems"></a>

### client.removeLineItems(checkoutId, lineItemIds, [query]) ⇒ <code>Promise</code> \| <code>GraphModel</code>
Removes line items from an existing checkout.

**Kind**: instance method of <code>[Client](#Client)</code>  
**Returns**: <code>Promise</code> \| <code>GraphModel</code> - A promise resolving with the updated checkout.  

| Param | Type | Description |
| --- | --- | --- |
| checkoutId | <code>String</code> | The ID of the checkout to remove line items from. |
| lineItemIds | <code>Array.&lt;String&gt;</code> | A list of the ids of line items to remove from the checkout. |
| [query] | <code>[checkoutQuery](#Client.Queries.checkoutQuery)</code> | Callback function to specify fields to query on the checkout returned. |

**Example**  
```js
const checkoutId = 'gid://shopify/Checkout/abc123';
const lineItemIds = ['gid://shopify/CheckoutLineItem/def456'];

client.removeLineItems(checkoutId, lineItemIds).then((checkout) => {
  // Do something with the updated checkout
});
```
<a name="Client+updateLineItems"></a>

### client.updateLineItems(checkoutId, lineItems, [query]) ⇒ <code>Promise</code> \| <code>GraphModel</code>
Updates line items on an existing checkout.

**Kind**: instance method of <code>[Client](#Client)</code>  
**Returns**: <code>Promise</code> \| <code>GraphModel</code> - A promise resolving with the updated checkout.  

| Param | Type | Description |
| --- | --- | --- |
| checkoutId | <code>String</code> | The ID of the checkout to update a line item on. |
| lineItems | <code>Array.&lt;Object&gt;</code> | A list of line item information to update. See the [Storefront API reference](https://help.shopify.com/api/storefront-api/reference/input_object/checkoutlineitemupdateinput) for valid input fields for each line item. |
| [query] | <code>[checkoutQuery](#Client.Queries.checkoutQuery)</code> | Callback function to specify fields to query on the checkout returned. |

**Example**  
```js
const checkoutId = 'gid://shopify/Checkout/abc123';
const lineItems = [
  {
    id: 'gid://shopify/CheckoutLineItem/def456',
    quantity: 5,
    variantId: 'gid://shopify/ProductVariant/2'
  }
];

client.updateLineItems(checkoutId, lineItems).then(checkout => {
  // Do something with the updated checkout
});
```
<a name="Client.Product"></a>

### Client.Product : <code>object</code>
A namespace providing utilities for product resources.

**Kind**: static namespace of <code>[Client](#Client)</code>  

* [.Product](#Client.Product) : <code>object</code>
    * [.Helpers](#Client.Product.Helpers) : <code>object</code>
        * [.variantForOptions(product, options)](#Client.Product.Helpers.variantForOptions) ⇒ <code>GraphModel</code>

<a name="Client.Product.Helpers"></a>

#### Product.Helpers : <code>object</code>
**Kind**: static namespace of <code>[Product](#Client.Product)</code>  
<a name="Client.Product.Helpers.variantForOptions"></a>

##### Helpers.variantForOptions(product, options) ⇒ <code>GraphModel</code>
Returns the variant of a product corresponding to the options given.

**Kind**: static method of <code>[Helpers](#Client.Product.Helpers)</code>  
**Returns**: <code>GraphModel</code> - The variant corresponding to the options given.  

| Param | Type | Description |
| --- | --- | --- |
| product | <code>GraphModel</code> | The product to find the variant on. Must include `variants`. |
| options | <code>Object</code> | An object containing the options for the variant. |

<a name="Client.Image"></a>

### Client.Image : <code>object</code>
A namespace providing utilities for image resources.

**Kind**: static namespace of <code>[Client](#Client)</code>  

* [.Image](#Client.Image) : <code>object</code>
    * [.Helpers](#Client.Image.Helpers) : <code>object</code>
        * [.imageForSize(image, options)](#Client.Image.Helpers.imageForSize) ⇒ <code>String</code>

<a name="Client.Image.Helpers"></a>

#### Image.Helpers : <code>object</code>
**Kind**: static namespace of <code>[Image](#Client.Image)</code>  
<a name="Client.Image.Helpers.imageForSize"></a>

##### Helpers.imageForSize(image, options) ⇒ <code>String</code>
Generates the image src for a resized image with maximum dimensions `maxWidth` and `maxHeight`.
Images do not scale up.

**Kind**: static method of <code>[Helpers](#Client.Image.Helpers)</code>  
**Returns**: <code>String</code> - The image src for the resized image.  

| Param | Type | Description |
| --- | --- | --- |
| image | <code>Object</code> | The original image model to generate the image src for. |
| options | <code>Object</code> | An options object containing: |
| options.maxHeight | <code>Integer</code> | The maximum height for the image. |
| options.maxWidth | <code>Integer</code> | The maximum width for the image. |

<a name="Client.Queries"></a>

### Client.Queries : <code>object</code>
A namespace providing the functions used to build different kinds of queries.

**Kind**: static namespace of <code>[Client](#Client)</code>  

* [.Queries](#Client.Queries) : <code>object</code>
    * [.checkoutQuery([fields])](#Client.Queries.checkoutQuery)
    * [.checkoutNodeQuery([fields])](#Client.Queries.checkoutNodeQuery)
    * [.collectionConnectionQuery([fields])](#Client.Queries.collectionConnectionQuery)
    * [.collectionNodeQuery([fields])](#Client.Queries.collectionNodeQuery)
    * [.customAttributeQuery([fields])](#Client.Queries.customAttributeQuery)
    * [.domainQuery([fields])](#Client.Queries.domainQuery)
    * [.imageConnectionQuery([fields])](#Client.Queries.imageConnectionQuery)
    * [.imageQuery([fields])](#Client.Queries.imageQuery)
    * [.lineItemConnectionQuery([fields])](#Client.Queries.lineItemConnectionQuery)
    * [.mailingAddressQuery([fields])](#Client.Queries.mailingAddressQuery)
    * [.optionQuery([fields])](#Client.Queries.optionQuery)
    * [.orderQuery([fields])](#Client.Queries.orderQuery)
    * [.productConnectionQuery([fields])](#Client.Queries.productConnectionQuery)
    * [.productNodeQuery([fields])](#Client.Queries.productNodeQuery)
    * [.selectedOptionQuery([fields])](#Client.Queries.selectedOptionQuery)
    * [.shippingRateQuery([fields])](#Client.Queries.shippingRateQuery)
    * [.shopPolicyQuery([fields])](#Client.Queries.shopPolicyQuery)
    * [.variantConnectionQuery([fields])](#Client.Queries.variantConnectionQuery)
    * [.variantQuery([fields])](#Client.Queries.variantQuery)

<a name="Client.Queries.checkoutQuery"></a>

#### Queries.checkoutQuery([fields])
Returns a callback function to build a checkout query with specified fields.
Use this for [createCheckout](#Client+createCheckout), [addLineItems](#Client+addLineItems), [updateLineItems](#Client+updateLineItems), and [removeLineItems](#Client+removeLineItems).

**Kind**: static method of <code>[Queries](#Client.Queries)</code>  

| Param | Type | Description |
| --- | --- | --- |
| [fields] | <code>Array</code> | A list of fields to query on the checkout. Default values are:   <ul>     <li>`'id'`</li>     <li>`'ready'`</li>     <li>`['lineItems', lineItemConnectionQuery()]`</li>     <li>`['shippingAddress', mailingAddressQuery()]`</li>     <li>`['shippingLine', shippingRateQuery()]`</li>     <li>`'requiresShipping'`</li>     <li>`['customAttributes', customAttributeQuery()]`</li>     <li>`'note'`</li>     <li>`'paymentDue'`</li>     <li>`'webUrl'`</li>     <li>`['order', orderQuery()]`</li>     <li>`'orderStatusUrl'`</li>     <li>`'taxExempt'`</li>     <li>`'taxesIncluded'`</li>     <li>`'currencyCode'`</li>     <li>`'totalTax'`</li>     <li>`'subtotalPrice'`</li>     <li>`'totalPrice'`</li>     <li>`'completedAt'`</li>     <li>`'createdAt'`</li>     <li>`'updatedAt'`</li>   </ul> See the [Storefront API reference](https://help.shopify.com/api/storefront-api/reference/object/checkout) for all possible values. |

**Example**  
```js
const query = checkoutQuery(['id', 'createdAt', ['lineItems', lineItemConnectionQuery()]]);
```
<a name="Client.Queries.checkoutNodeQuery"></a>

#### Queries.checkoutNodeQuery([fields])
Returns a callback function to build a checkout query off the root query with specified fields.
Use this for [fetchCheckout](#Client+fetchCheckout).

**Kind**: static method of <code>[Queries](#Client.Queries)</code>  

| Param | Type | Description |
| --- | --- | --- |
| [fields] | <code>Array</code> | A list of fields to query on the checkout. Default values are:   <ul>     <li>`'id'`</li>     <li>`'ready'`</li>     <li>`['lineItems', lineItemConnectionQuery()]`</li>     <li>`['shippingAddress', mailingAddressQuery()]`</li>     <li>`['shippingLine', shippingRateQuery()]`</li>     <li>`'requiresShipping'`</li>     <li>`['customAttributes', customAttributeQuery()]`</li>     <li>`'note'`</li>     <li>`'paymentDue'`</li>     <li>`'webUrl'`</li>     <li>`['order', orderQuery()]`</li>     <li>`'orderStatusUrl'`</li>     <li>`'taxExempt'`</li>     <li>`'taxesIncluded'`</li>     <li>`'currencyCode'`</li>     <li>`'totalTax'`</li>     <li>`'subtotalPrice'`</li>     <li>`'totalPrice'`</li>     <li>`'completedAt'`</li>     <li>`'createdAt'`</li>     <li>`'updatedAt'`</li>   </ul> See the [Storefront API reference](https://help.shopify.com/api/storefront-api/reference/object/checkout) for all possible values. |

**Example**  
```js
const query = checkoutNodeQuery(['id', 'createdAt', ['lineItems', lineItemConnectionQuery()]]);
```
<a name="Client.Queries.collectionConnectionQuery"></a>

#### Queries.collectionConnectionQuery([fields])
Returns a callback function to build a collection connection query with specified fields.
Use this when fetching multiple collections.

**Kind**: static method of <code>[Queries](#Client.Queries)</code>  

| Param | Type | Description |
| --- | --- | --- |
| [fields] | <code>Array</code> | A list of fields to query on the collections. Default values are:   <ul>     <li>`'id'`</li>     <li>`'handle'`</li>     <li>`'description'`</li>     <li>`'descriptionHtml'`</li>     <li>`'updatedAt'`</li>     <li>`'title'`</li>     <li>`['image', imageQuery()]`</li>   </ul> See the [Storefront API reference](https://help.shopify.com/api/storefront-api/reference/object/collection) for all possible values. |

**Example**  
```js
const query = collectionConnectionQuery(['id', 'handle', ['image', imageQuery()]]);
```
<a name="Client.Queries.collectionNodeQuery"></a>

#### Queries.collectionNodeQuery([fields])
Returns a callback function to build a collection query off the root query with specified fields.
Use this when fetching a single collection.

**Kind**: static method of <code>[Queries](#Client.Queries)</code>  

| Param | Type | Description |
| --- | --- | --- |
| [fields] | <code>Array</code> | A list of fields to query on the collections. Default values are:   <ul>     <li>`'id'`</li>     <li>`'handle'`</li>     <li>`'description'`</li>     <li>`'descriptionHtml'`</li>     <li>`'updatedAt'`</li>     <li>`'title'`</li>     <li>`['image', imageQuery()]`</li>   </ul> See the [Storefront API reference](https://help.shopify.com/api/storefront-api/reference/object/collection) for all possible values. |

**Example**  
```js
const query = collectionNodeQuery(['id', 'handle', ['image', imageQuery()]]);
```
<a name="Client.Queries.customAttributeQuery"></a>

#### Queries.customAttributeQuery([fields])
Returns a callback function to build a custom attribute query with specified fields.

**Kind**: static method of <code>[Queries](#Client.Queries)</code>  

| Param | Type | Description |
| --- | --- | --- |
| [fields] | <code>Array</code> | A list of fields to query on the custom attribute. Default values are:   <ul>     <li>`'key'`</li>     <li>`'value'`</li>   </ul> See the [Storefront API reference](https://help.shopify.com/api/storefront-api/reference/object/attribute) for all possible values. |

**Example**  
```js
const query = customAttributeQuery(['key']);
```
<a name="Client.Queries.domainQuery"></a>

#### Queries.domainQuery([fields])
Returns a callback function to build a domain query with specified fields.

**Kind**: static method of <code>[Queries](#Client.Queries)</code>  

| Param | Type | Description |
| --- | --- | --- |
| [fields] | <code>Array</code> | A list of fields to query on the domain. Default values are:   <ul>     <li>`'host'`</li>     <li>`'sslEnabled'`</li>     <li>`'url'`</li>   </ul> See the [Storefront API reference](https://help.shopify.com/api/storefront-api/reference/object/domain) for all possible values. |

**Example**  
```js
const query = domainQuery(['url']);
```
<a name="Client.Queries.imageConnectionQuery"></a>

#### Queries.imageConnectionQuery([fields])
Returns a callback function to build an image connection query with specified fields.
Use this when fetching multiple images.

**Kind**: static method of <code>[Queries](#Client.Queries)</code>  

| Param | Type | Description |
| --- | --- | --- |
| [fields] | <code>Array</code> | A list of fields to query on the images. Default values are:   <ul>     <li>`'id'`</li>     <li>`'src'`</li>     <li>`'altText'`</li>   </ul> See the [Storefront API reference](https://help.shopify.com/api/storefront-api/reference/object/image) for all possible values. |

**Example**  
```js
const query = imageConnectionQuery(['id', 'src']);
```
<a name="Client.Queries.imageQuery"></a>

#### Queries.imageQuery([fields])
Returns a callback function to build an image query with specified fields.
Use this when fetching a single image.

**Kind**: static method of <code>[Queries](#Client.Queries)</code>  

| Param | Type | Description |
| --- | --- | --- |
| [fields] | <code>Array</code> | A list of fields to query on the image. Default values are:   <ul>     <li>`'id'`</li>     <li>`'src'`</li>     <li>`'altText'`</li>   </ul> See the [Storefront API reference](https://help.shopify.com/api/storefront-api/reference/object/image) for all possible values. |

**Example**  
```js
const query = imageQuery(['id', 'src']);
```
<a name="Client.Queries.lineItemConnectionQuery"></a>

#### Queries.lineItemConnectionQuery([fields])
Returns a callback function to build a line item connection query with specified fields.
Use this when fetching multiple line items.

**Kind**: static method of <code>[Queries](#Client.Queries)</code>  

| Param | Type | Description |
| --- | --- | --- |
| [fields] | <code>Array</code> | A list of fields to query on the line items. Default values are:   <ul>     <li>`'title'`</li>     <li>`['variant', variantQuery()]`</li>     <li>`'quantity'`</li>     <li>`['customAttributes', customAttributeQuery()]`</li>   </ul> See the [Storefront API reference](https://help.shopify.com/api/storefront-api/reference/object/checkoutlineitem) for all possible values. |

**Example**  
```js
const query = lineItemConnectionQuery(['quantity', ['variant', variantQuery()]]);
```
<a name="Client.Queries.mailingAddressQuery"></a>

#### Queries.mailingAddressQuery([fields])
Returns a callback function to build a mailing address query with specified fields.

**Kind**: static method of <code>[Queries](#Client.Queries)</code>  

| Param | Type | Description |
| --- | --- | --- |
| [fields] | <code>Array</code> | A list of fields to query on the mailing address. Default values are:   <ul>     <li>`'address1'`</li>     <li>`'address2'`</li>     <li>`'city'`</li>     <li>`'company'`</li>     <li>`'country'`</li>     <li>`'firstName'`</li>     <li>`'formatted'`</li>     <li>`'lastName'`</li>     <li>`'latitude'`</li>     <li>`'longitude'`</li>     <li>`'phone'`</li>     <li>`'province'`</li>     <li>`'zip'`</li>     <li>`'name'`</li>     <li>`'countryCode'`</li>     <li>`'provinceCode'`</li>     <li>`'id'`</li>   </ul> See the [Storefront API reference](https://help.shopify.com/api/storefront-api/reference/object/mailingaddress) for all possible values. |

**Example**  
```js
const query = mailingAddressQuery(['city', 'province', 'country']);
```
<a name="Client.Queries.optionQuery"></a>

#### Queries.optionQuery([fields])
Returns a callback function to build an options query with specified fields.

**Kind**: static method of <code>[Queries](#Client.Queries)</code>  

| Param | Type | Description |
| --- | --- | --- |
| [fields] | <code>Array</code> | A list of fields to query on the options. Default values are:   <ul>     <li>`'id'`</li>     <li>`'name'`</li>     <li>`'values'`</li>   </ul> See the [Storefront API reference](https://help.shopify.com/api/storefront-api/reference/object/productoption) for all possible values. |

**Example**  
```js
const query = optionQuery(['name']);
```
<a name="Client.Queries.orderQuery"></a>

#### Queries.orderQuery([fields])
Returns a callback function to build an order query with specified fields.

**Kind**: static method of <code>[Queries](#Client.Queries)</code>  

| Param | Type | Description |
| --- | --- | --- |
| [fields] | <code>Array</code> | A list of fields to query on the order. Default values are:   <ul>     <li>`'id'`</li>     <li>`'cancelReason'`</li>     <li>`'cancelledAt'`</li>     <li>`'createdAt'`</li>     <li>`'updatedAt'`</li>     <li>`'processedAt'`</li>     <li>`'orderNumber'`</li>     <li>`'subtotalPrice'`</li>     <li>`'totalShippingPrice'`</li>     <li>`'totalTax'`</li>     <li>`'totalPrice'`</li>     <li>`'currencyCode'`</li>     <li>`'totalRefunded'`</li>     <li>`'displayFulfillmentStatus'`</li>     <li>`'displayFinancialStatus'`</li>     <li>`'customerUrl'`</li>     <li>`['shippingAddress', mailingAddressQuery()]`</li>     <li>`['lineItems', lineItemConnectionQuery()]`</li>   </ul> See the [Storefront API reference](https://help.shopify.com/api/storefront-api/reference/object/order) for all possible values. |

**Example**  
```js
const query = orderQuery(['totalRefunded', 'cancelReason']);
```
<a name="Client.Queries.productConnectionQuery"></a>

#### Queries.productConnectionQuery([fields])
Returns a callback function to build a product connection query with specified fields.
Use this when fetching multiple products.

**Kind**: static method of <code>[Queries](#Client.Queries)</code>  

| Param | Type | Description |
| --- | --- | --- |
| [fields] | <code>Array</code> | A list of fields to query on the products. Default values are:   <ul>     <li>`'id'`</li>     <li>`'createdAt'`</li>     <li>`'updatedAt'`</li>     <li>`'descriptionHtml'`</li>     <li>`'description'`</li>     <li>`'handle'`</li>     <li>`'productType'`</li>     <li>`'title'`</li>     <li>`'vendor'`</li>     <li>`'tags'`</li>     <li>`'publishedAt'`</li>     <li>`['options', optionQuery()]`</li>     <li>`['images', imageConnectionQuery()]`</li>     <li>`['variants', variantConnectionQuery()]`</li>   </ul> See the [Storefront API reference](https://help.shopify.com/api/storefront-api/reference/object/product) for all possible values. |

**Example**  
```js
const query = productConnectionQuery(['id', 'handle', ['image', imageQuery()]]);
```
<a name="Client.Queries.productNodeQuery"></a>

#### Queries.productNodeQuery([fields])
Returns a callback function to build a product query off the root query with specified fields.
Use this when fetching a single product.

**Kind**: static method of <code>[Queries](#Client.Queries)</code>  

| Param | Type | Description |
| --- | --- | --- |
| [fields] | <code>Array</code> | A list of fields to query on the products. Default values are:   <ul>     <li>`'id'`</li>     <li>`'createdAt'`</li>     <li>`'updatedAt'`</li>     <li>`'descriptionHtml'`</li>     <li>`'description'`</li>     <li>`'handle'`</li>     <li>`'productType'`</li>     <li>`'title'`</li>     <li>`'vendor'`</li>     <li>`'tags'`</li>     <li>`'publishedAt'`</li>     <li>`['options', optionQuery()]`</li>     <li>`['images', imageConnectionQuery()]`</li>     <li>`['variants', variantConnectionQuery()]`</li>   </ul> See the [Storefront API reference](https://help.shopify.com/api/storefront-api/reference/object/product) for all possible values. |

**Example**  
```js
const query = productNodeQuery(['id', 'handle', ['image', imageQuery()]]);
```
<a name="Client.Queries.selectedOptionQuery"></a>

#### Queries.selectedOptionQuery([fields])
Returns a callback function to build a selection option query with specified fields.

**Kind**: static method of <code>[Queries](#Client.Queries)</code>  

| Param | Type | Description |
| --- | --- | --- |
| [fields] | <code>Array</code> | A list of fields to query on the selected option. Default values are:   <ul>     <li>`'name'`</li>     <li>`'value'`</li>   </ul> See the [Storefront API reference](https://help.shopify.com/api/storefront-api/reference/object/selectedoption) for all possible values. |

**Example**  
```js
const query = selectedOptionQuery(['name']);
```
<a name="Client.Queries.shippingRateQuery"></a>

#### Queries.shippingRateQuery([fields])
Returns a callback function to build a shipping rate query with specified fields.

**Kind**: static method of <code>[Queries](#Client.Queries)</code>  

| Param | Type | Description |
| --- | --- | --- |
| [fields] | <code>Array</code> | A list of fields to query on the shipping rate. Default values are:   <ul>     <li>`'handle'`</li>     <li>`'price'`</li>     <li>`'title'`</li>   </ul> See the [Storefront API reference](https://help.shopify.com/api/storefront-api/reference/object/shippingrate) for all possible values. |

**Example**  
```js
const query = shippingRateQuery(['price', 'title']);
```
<a name="Client.Queries.shopPolicyQuery"></a>

#### Queries.shopPolicyQuery([fields])
Returns a callback function to build a shop policy query with specified fields.

**Kind**: static method of <code>[Queries](#Client.Queries)</code>  

| Param | Type | Description |
| --- | --- | --- |
| [fields] | <code>Array</code> | A list of fields to query on the shop policy. Default values are:   <ul>     <li>`'id'`</li>     <li>`'title'`</li>     <li>`'url'`</li>     <li>`'body'`</li>   </ul> See the [Storefront API reference](https://help.shopify.com/api/storefront-api/reference/object/shoppolicy) for all possible values. |

**Example**  
```js
const query = shopPolicyQuery(['title', 'body']);
```
<a name="Client.Queries.variantConnectionQuery"></a>

#### Queries.variantConnectionQuery([fields])
Returns a callback function to build a product variant connection query with specified fields.
Use this when fetching multiple variants.

**Kind**: static method of <code>[Queries](#Client.Queries)</code>  

| Param | Type | Description |
| --- | --- | --- |
| [fields] | <code>Array</code> | A list of fields to query on the variants. Default values are:   <ul>     <li>`'id'`</li>     <li>`'title'`</li>     <li>`'price'`</li>     <li>`'weight'`</li>     <li>`['image', imageQuery()]`</li>     <li>`['selectedOptions', selectedOptionQuery()]`</li>   </ul> See the [Storefront API reference](https://help.shopify.com/api/storefront-api/reference/object/productvariant) for all possible values. |

**Example**  
```js
const query = variantConnectionQuery(['id', 'handle', ['image', imageQuery()]]);
```
<a name="Client.Queries.variantQuery"></a>

#### Queries.variantQuery([fields])
Returns a callback function to build a product variant query with specified fields.
Use this when fetching a single variant.

**Kind**: static method of <code>[Queries](#Client.Queries)</code>  

| Param | Type | Description |
| --- | --- | --- |
| [fields] | <code>Array</code> | A list of fields to query on the variants. Default values are:   <ul>     <li>`'id'`</li>     <li>`'title'`</li>     <li>`'price'`</li>     <li>`'weight'`</li>     <li>`['image', imageQuery()]`</li>     <li>`['selectedOptions', selectedOptionQuery()]`</li>   </ul> See the [Storefront API reference](https://help.shopify.com/api/storefront-api/reference/object/productvariant) for all possible values. |

**Example**  
```js
const query = variantQuery(['id', 'src']);
```
<a name="Config"></a>

## Config
The class used to configure the JS Buy SDK Client.

**Kind**: global class  
<a name="new_Config_new"></a>

### new Config(attrs)

| Param | Type | Description |
| --- | --- | --- |
| attrs | <code>Object</code> | An object specifying the configuration. Requires the following properties: |
| attrs.storefrontAccessToken | <code>String</code> | The storefront access token for the shop. |
| attrs.domain | <code>String</code> | The `myshopify` domain for the shop (e.g. `graphql.myshopify.com`). |

