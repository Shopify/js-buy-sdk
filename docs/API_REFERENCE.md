## Classes

<dl>
<dt><a href="#CheckoutResource">CheckoutResource</a></dt>
<dd><p>The JS Buy SDK checkout resource</p>
</dd>
<dt><a href="#Client">Client</a></dt>
<dd><p>The JS Buy SDK Client.</p>
</dd>
<dt><a href="#CollectionResource">CollectionResource</a></dt>
<dd><p>The JS Buy SDK collection resource</p>
</dd>
<dt><a href="#Config">Config</a></dt>
<dd><p>The class used to configure the JS Buy SDK Client.</p>
</dd>
<dt><a href="#ImageResource">ImageResource</a></dt>
<dd><p>The JS Buy SDK image resource</p>
</dd>
<dt><a href="#ProductResource">ProductResource</a></dt>
<dd><p>The JS Buy SDK product resource</p>
</dd>
<dt><a href="#ShopResource">ShopResource</a></dt>
<dd><p>The JS Buy SDK shop resource</p>
</dd>
</dl>

<a name="CheckoutResource"></a>

## CheckoutResource
The JS Buy SDK checkout resource

**Kind**: global class  

* [CheckoutResource](#CheckoutResource)
    * [.fetch(id)](#CheckoutResource+fetch) ⇒ <code>Promise</code> \| <code>GraphModel</code>
    * [.create([input])](#CheckoutResource+create) ⇒ <code>Promise</code> \| <code>GraphModel</code>
    * [.addLineItems(checkoutId, lineItems)](#CheckoutResource+addLineItems) ⇒ <code>Promise</code> \| <code>GraphModel</code>
    * [.removeLineItems(checkoutId, lineItemIds)](#CheckoutResource+removeLineItems) ⇒ <code>Promise</code> \| <code>GraphModel</code>
    * [.updateLineItems(checkoutId, lineItems)](#CheckoutResource+updateLineItems) ⇒ <code>Promise</code> \| <code>GraphModel</code>

<a name="CheckoutResource+fetch"></a>

### checkoutResource.fetch(id) ⇒ <code>Promise</code> \| <code>GraphModel</code>
Fetches a checkout by ID.

**Kind**: instance method of [<code>CheckoutResource</code>](#CheckoutResource)  
**Returns**: <code>Promise</code> \| <code>GraphModel</code> - A promise resolving with a `GraphModel` of the checkout.  

| Param | Type | Description |
| --- | --- | --- |
| id | <code>String</code> | The id of the checkout to fetch. |

**Example**  
```js
client.checkout.fetch('FlZj9rZXlN5MDY4ZDFiZTUyZTUwNTE2MDNhZjg=').then((checkout) => {
  // Do something with the checkout
});
```
<a name="CheckoutResource+create"></a>

### checkoutResource.create([input]) ⇒ <code>Promise</code> \| <code>GraphModel</code>
Creates a checkout.

**Kind**: instance method of [<code>CheckoutResource</code>](#CheckoutResource)  
**Returns**: <code>Promise</code> \| <code>GraphModel</code> - A promise resolving with the created checkout.  

| Param | Type | Description |
| --- | --- | --- |
| [input] | <code>Object</code> | An input object containing zero or more of: |
| [input.email] | <code>String</code> | An email connected to the checkout. |
| [input.lineItems] | <code>Array.&lt;Object&gt;</code> | A list of line items in the checkout. See the [Storefront API reference](https://help.shopify.com/api/storefront-api/reference/input_object/checkoutlineiteminput) for valid input fields for each line item. |
| [input.shippingAddress] | <code>Object</code> | A shipping address. See the [Storefront API reference](https://help.shopify.com/api/storefront-api/reference/input_object/mailingaddressinput) for valid input fields. |
| [input.note] | <code>String</code> | A note for the checkout. |
| [input.customAttributes] | <code>Array.&lt;Object&gt;</code> | A list of custom attributes for the checkout. See the [Storefront API reference](https://help.shopify.com/api/storefront-api/reference/input_object/attributeinput) for valid input fields. |

**Example**  
```js
const input = {
  lineItems: [
    {variantId: 'Z2lkOi8vc2hvcGlmeS9Qcm9kdWN0VmFyaWFudC8yOTEwNjAyMjc5Mg==', quantity: 5}
  ]
};

client.checkout.create(input).then((checkout) => {
  // Do something with the newly created checkout
});
```
<a name="CheckoutResource+addLineItems"></a>

### checkoutResource.addLineItems(checkoutId, lineItems) ⇒ <code>Promise</code> \| <code>GraphModel</code>
Adds line items to an existing checkout.

**Kind**: instance method of [<code>CheckoutResource</code>](#CheckoutResource)  
**Returns**: <code>Promise</code> \| <code>GraphModel</code> - A promise resolving with the updated checkout.  

| Param | Type | Description |
| --- | --- | --- |
| checkoutId | <code>String</code> | The ID of the checkout to add line items to. |
| lineItems | <code>Array.&lt;Object&gt;</code> | A list of line items to add to the checkout. See the [Storefront API reference](https://help.shopify.com/api/storefront-api/reference/input_object/checkoutlineiteminput) for valid input fields for each line item. |

**Example**  
```js
const checkoutId = 'Z2lkOi8vc2hvcGlmeS9DaGVja291dC9kMTZmM2EzMDM4Yjc4N=';
const lineItems = [{variantId: 'Z2lkOi8vc2hvcGlmeS9Qcm9kdWN0VmFyaWFudC8yOTEwNjAyMjc5Mg==', quantity: 5}];

client.checkout.addLineItems(checkoutId, lineItems).then((checkout) => {
  // Do something with the updated checkout
});
```
<a name="CheckoutResource+removeLineItems"></a>

### checkoutResource.removeLineItems(checkoutId, lineItemIds) ⇒ <code>Promise</code> \| <code>GraphModel</code>
Removes line items from an existing checkout.

**Kind**: instance method of [<code>CheckoutResource</code>](#CheckoutResource)  
**Returns**: <code>Promise</code> \| <code>GraphModel</code> - A promise resolving with the updated checkout.  

| Param | Type | Description |
| --- | --- | --- |
| checkoutId | <code>String</code> | The ID of the checkout to remove line items from. |
| lineItemIds | <code>Array.&lt;String&gt;</code> | A list of the ids of line items to remove from the checkout. |

**Example**  
```js
const checkoutId = 'Z2lkOi8vc2hvcGlmeS9DaGVja291dC9kMTZmM2EzMDM4Yjc4N=';
const lineItemIds = ['TViZGE5Y2U1ZDFhY2FiMmM2YT9rZXk9NTc2YjBhODcwNWIxYzg0YjE5ZjRmZGQ5NjczNGVkZGU='];

client.checkout.removeLineItems(checkoutId, lineItemIds).then((checkout) => {
  // Do something with the updated checkout
});
```
<a name="CheckoutResource+updateLineItems"></a>

### checkoutResource.updateLineItems(checkoutId, lineItems) ⇒ <code>Promise</code> \| <code>GraphModel</code>
Updates line items on an existing checkout.

**Kind**: instance method of [<code>CheckoutResource</code>](#CheckoutResource)  
**Returns**: <code>Promise</code> \| <code>GraphModel</code> - A promise resolving with the updated checkout.  

| Param | Type | Description |
| --- | --- | --- |
| checkoutId | <code>String</code> | The ID of the checkout to update a line item on. |
| lineItems | <code>Array.&lt;Object&gt;</code> | A list of line item information to update. See the [Storefront API reference](https://help.shopify.com/api/storefront-api/reference/input_object/checkoutlineitemupdateinput) for valid input fields for each line item. |

**Example**  
```js
const checkoutId = 'Z2lkOi8vc2hvcGlmeS9DaGVja291dC9kMTZmM2EzMDM4Yjc4N=';
const lineItems = [
  {
    id: 'TViZGE5Y2U1ZDFhY2FiMmM2YT9rZXk9NTc2YjBhODcwNWIxYzg0YjE5ZjRmZGQ5NjczNGVkZGU=',
    quantity: 5,
    variantId: 'Z2lkOi8vc2hvcGlmeS9Qcm9kdWN0VmFyaWFudC8yOTEwNjAyMjc5Mg=='
  }
];

client.checkout.updateLineItems(checkoutId, lineItems).then(checkout => {
  // Do something with the updated checkout
});
```
<a name="Client"></a>

## Client
The JS Buy SDK Client.

**Kind**: global class  
**Properties**

| Name | Type | Description |
| --- | --- | --- |
| product | [<code>ProductResource</code>](#ProductResource) | The property under which product fetching methods live. |
| collection | [<code>CollectionResource</code>](#CollectionResource) | The property under which collection fetching methods live. |
| shop | [<code>ShopResource</code>](#ShopResource) | The property under which shop fetching methods live. |
| checkout | [<code>CheckoutResource</code>](#CheckoutResource) | The property under which shop fetching and mutating methods live. |
| image | [<code>ImageResource</code>](#ImageResource) | The property under which image helper methods live. |


* [Client](#Client)
    * [new Client(config)](#new_Client_new)
    * _instance_
        * [.fetchNextPage([Array])](#Client+fetchNextPage) ⇒ <code>Promise</code> \| <code>Array.&lt;GraphModel&gt;</code>
    * _static_
        * [.buildClient()](#Client.buildClient)

<a name="new_Client_new"></a>

### new Client(config)

| Param | Type | Description |
| --- | --- | --- |
| config | [<code>Config</code>](#Config) | An instance of [Config](#Config) used to configure the Client. |

<a name="Client+fetchNextPage"></a>

### client.fetchNextPage([Array]) ⇒ <code>Promise</code> \| <code>Array.&lt;GraphModel&gt;</code>
Fetches the next page of models

**Kind**: instance method of [<code>Client</code>](#Client)  
**Returns**: <code>Promise</code> \| <code>Array.&lt;GraphModel&gt;</code> - A promise resolving with an array of `GraphModel`s of the type provided.  

| Param | Type | Description |
| --- | --- | --- |
| [Array] | <code>models</code> | The paginated set to fetch the next page of |

**Example**  
```js
client.fetchNextPage(products).then((nextProducts) => {
  // Do something with the products
});
```
<a name="Client.buildClient"></a>

### Client.buildClient()
Primary entry point for building a new Client.

**Kind**: static method of [<code>Client</code>](#Client)  
<a name="CollectionResource"></a>

## CollectionResource
The JS Buy SDK collection resource

**Kind**: global class  

* [CollectionResource](#CollectionResource)
    * [.fetchAll()](#CollectionResource+fetchAll) ⇒ <code>Promise</code> \| <code>Array.&lt;GraphModel&gt;</code>
    * [.fetchAllWithProducts()](#CollectionResource+fetchAllWithProducts) ⇒ <code>Promise</code> \| <code>Array.&lt;GraphModel&gt;</code>
    * [.fetch(id)](#CollectionResource+fetch) ⇒ <code>Promise</code> \| <code>GraphModel</code>
    * [.fetchWithProducts(id)](#CollectionResource+fetchWithProducts) ⇒ <code>Promise</code> \| <code>GraphModel</code>
    * [.fetchByHandle(handle)](#CollectionResource+fetchByHandle) ⇒ <code>Promise</code> \| <code>GraphModel</code>
    * [.fetchQuery([args])](#CollectionResource+fetchQuery) ⇒ <code>Promise</code> \| <code>Array.&lt;GraphModel&gt;</code>

<a name="CollectionResource+fetchAll"></a>

### collectionResource.fetchAll() ⇒ <code>Promise</code> \| <code>Array.&lt;GraphModel&gt;</code>
Fetches all collections on the shop, not including products.
To fetch collections with products use [fetchAllsWithProducts](Client#fetchAllsWithProducts).

**Kind**: instance method of [<code>CollectionResource</code>](#CollectionResource)  
**Returns**: <code>Promise</code> \| <code>Array.&lt;GraphModel&gt;</code> - A promise resolving with an array of `GraphModel`s of the collections.  
**Example**  
```js
client.collection.fetchAll().then((collections) => {
  // Do something with the collections
});
```
<a name="CollectionResource+fetchAllWithProducts"></a>

### collectionResource.fetchAllWithProducts() ⇒ <code>Promise</code> \| <code>Array.&lt;GraphModel&gt;</code>
Fetches all collections on the shop, including products.

**Kind**: instance method of [<code>CollectionResource</code>](#CollectionResource)  
**Returns**: <code>Promise</code> \| <code>Array.&lt;GraphModel&gt;</code> - A promise resolving with an array of `GraphModel`s of the collections.  
**Example**  
```js
client.collection.fetchAllWithProducts().then((collections) => {
  // Do something with the collections
});
```
<a name="CollectionResource+fetch"></a>

### collectionResource.fetch(id) ⇒ <code>Promise</code> \| <code>GraphModel</code>
Fetches a single collection by ID on the shop, not including products.
To fetch the collection with products use [fetchWithProducts](Client#fetchWithProducts).

**Kind**: instance method of [<code>CollectionResource</code>](#CollectionResource)  
**Returns**: <code>Promise</code> \| <code>GraphModel</code> - A promise resolving with a `GraphModel` of the collection.  

| Param | Type | Description |
| --- | --- | --- |
| id | <code>String</code> | The id of the collection to fetch. |

**Example**  
```js
client.collection.fetch('Xk9lM2JkNzFmNzIQ4NTIY4ZDFiZTUyZTUwNTE2MDNhZjg==').then((collection) => {
  // Do something with the collection
});
```
<a name="CollectionResource+fetchWithProducts"></a>

### collectionResource.fetchWithProducts(id) ⇒ <code>Promise</code> \| <code>GraphModel</code>
Fetches a single collection by ID on the shop, including products.

**Kind**: instance method of [<code>CollectionResource</code>](#CollectionResource)  
**Returns**: <code>Promise</code> \| <code>GraphModel</code> - A promise resolving with a `GraphModel` of the collection.  

| Param | Type | Description |
| --- | --- | --- |
| id | <code>String</code> | The id of the collection to fetch. |

**Example**  
```js
client.collection.fetchWithProducts('Xk9lM2JkNzFmNzIQ4NTIY4ZDFiZTUyZTUwNTE2MDNhZjg==').then((collection) => {
  // Do something with the collection
});
```
<a name="CollectionResource+fetchByHandle"></a>

### collectionResource.fetchByHandle(handle) ⇒ <code>Promise</code> \| <code>GraphModel</code>
Fetches a collection by handle on the shop.

**Kind**: instance method of [<code>CollectionResource</code>](#CollectionResource)  
**Returns**: <code>Promise</code> \| <code>GraphModel</code> - A promise resolving with a `GraphModel` of the collection.  

| Param | Type | Description |
| --- | --- | --- |
| handle | <code>String</code> | The handle of the collection to fetch. |

**Example**  
```js
client.collection.fetchByHandle('my-collection').then((collection) => {
  // Do something with the collection
});
```
<a name="CollectionResource+fetchQuery"></a>

### collectionResource.fetchQuery([args]) ⇒ <code>Promise</code> \| <code>Array.&lt;GraphModel&gt;</code>
Fetches all collections on the shop that match the query.

**Kind**: instance method of [<code>CollectionResource</code>](#CollectionResource)  
**Returns**: <code>Promise</code> \| <code>Array.&lt;GraphModel&gt;</code> - A promise resolving with an array of `GraphModel`s of the collections.  

| Param | Type | Default | Description |
| --- | --- | --- | --- |
| [args] | <code>Object</code> |  | An object specifying the query data containing zero or more of: |
| [args.first] | <code>Int</code> | <code>20</code> | The relay `first` param. This specifies page size. |
| [args.sortKey] | <code>String</code> | <code>ID</code> | The key to sort results by. Available values are   documented as [Collection Sort Keys](https://help.shopify.com/api/storefront-api/reference/enum/collectionsortkeys). |
| [args.query] | <code>String</code> |  | A query string. See full documentation [here](https://help.shopify.com/api/storefront-api/reference/object/shop#collections) |
| [args.reverse] | <code>Boolean</code> |  | Whether or not to reverse the sort order of the results |

**Example**  
```js
client.collection.fetchQuery({first: 20, sortKey: 'CREATED_AT', reverse: true}).then((collections) => {
  // Do something with the first 10 collections sorted by title in ascending order
});
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
| attrs.storefrontAccessToken | <code>String</code> | The [Storefront access token](https://help.shopify.com/api/reference/storefront_access_token) for the shop. |
| attrs.domain | <code>String</code> | The `myshopify` domain for the shop (e.g. `graphql.myshopify.com`). |

<a name="ImageResource"></a>

## ImageResource
The JS Buy SDK image resource

**Kind**: global class  
<a name="ProductResource"></a>

## ProductResource
The JS Buy SDK product resource

**Kind**: global class  

* [ProductResource](#ProductResource)
    * [.fetchAll([pageSize])](#ProductResource+fetchAll) ⇒ <code>Promise</code> \| <code>Array.&lt;GraphModel&gt;</code>
    * [.fetch(id)](#ProductResource+fetch) ⇒ <code>Promise</code> \| <code>GraphModel</code>
    * [.fetchMultiple(ids)](#ProductResource+fetchMultiple) ⇒ <code>Promise</code> \| <code>Array.&lt;GraphModel&gt;</code>
    * [.fetchByHandle(handle)](#ProductResource+fetchByHandle) ⇒ <code>Promise</code> \| <code>GraphModel</code>
    * [.fetchQuery([args])](#ProductResource+fetchQuery) ⇒ <code>Promise</code> \| <code>Array.&lt;GraphModel&gt;</code>

<a name="ProductResource+fetchAll"></a>

### productResource.fetchAll([pageSize]) ⇒ <code>Promise</code> \| <code>Array.&lt;GraphModel&gt;</code>
Fetches all products on the shop.

**Kind**: instance method of [<code>ProductResource</code>](#ProductResource)  
**Returns**: <code>Promise</code> \| <code>Array.&lt;GraphModel&gt;</code> - A promise resolving with an array of `GraphModel`s of the products.  

| Param | Type | Default | Description |
| --- | --- | --- | --- |
| [pageSize] | <code>Int</code> | <code>20</code> | The number of products to fetch per page |

**Example**  
```js
client.product.fetchAll().then((products) => {
  // Do something with the products
});
```
<a name="ProductResource+fetch"></a>

### productResource.fetch(id) ⇒ <code>Promise</code> \| <code>GraphModel</code>
Fetches a single product by ID on the shop.

**Kind**: instance method of [<code>ProductResource</code>](#ProductResource)  
**Returns**: <code>Promise</code> \| <code>GraphModel</code> - A promise resolving with a `GraphModel` of the product.  

| Param | Type | Description |
| --- | --- | --- |
| id | <code>String</code> | The id of the product to fetch. |

**Example**  
```js
client.product.fetch('Xk9lM2JkNzFmNzIQ4NTIY4ZDFi9DaGVja291dC9lM2JkN==').then((product) => {
  // Do something with the product
});
```
<a name="ProductResource+fetchMultiple"></a>

### productResource.fetchMultiple(ids) ⇒ <code>Promise</code> \| <code>Array.&lt;GraphModel&gt;</code>
Fetches multiple products by ID on the shop.

**Kind**: instance method of [<code>ProductResource</code>](#ProductResource)  
**Returns**: <code>Promise</code> \| <code>Array.&lt;GraphModel&gt;</code> - A promise resolving with a `GraphModel` of the product.  

| Param | Type | Description |
| --- | --- | --- |
| ids | <code>Array.&lt;String&gt;</code> | The ids of the products to fetch |

**Example**  
```js
const ids = ['Xk9lM2JkNzFmNzIQ4NTIY4ZDFi9DaGVja291dC9lM2JkN==', 'Z2lkOi8vc2hvcGlmeS9Qcm9kdWN0Lzc4NTc5ODkzODQ='];
client.product.fetchMultiple(ids).then((products) => {
  // Do something with the products
});
```
<a name="ProductResource+fetchByHandle"></a>

### productResource.fetchByHandle(handle) ⇒ <code>Promise</code> \| <code>GraphModel</code>
Fetches a single product by handle on the shop.

**Kind**: instance method of [<code>ProductResource</code>](#ProductResource)  
**Returns**: <code>Promise</code> \| <code>GraphModel</code> - A promise resolving with a `GraphModel` of the product.  

| Param | Type | Description |
| --- | --- | --- |
| handle | <code>String</code> | The handle of the product to fetch. |

**Example**  
```js
client.product.fetchByHandle('my-product').then((product) => {
  // Do something with the product
});
```
<a name="ProductResource+fetchQuery"></a>

### productResource.fetchQuery([args]) ⇒ <code>Promise</code> \| <code>Array.&lt;GraphModel&gt;</code>
Fetches all products on the shop that match the query.

**Kind**: instance method of [<code>ProductResource</code>](#ProductResource)  
**Returns**: <code>Promise</code> \| <code>Array.&lt;GraphModel&gt;</code> - A promise resolving with an array of `GraphModel`s of the products.  

| Param | Type | Default | Description |
| --- | --- | --- | --- |
| [args] | <code>Object</code> |  | An object specifying the query data containing zero or more of: |
| [args.first] | <code>Int</code> | <code>20</code> | The relay `first` param. This specifies page size. |
| [args.sortKey] | <code>String</code> | <code>ID</code> | The key to sort results by. Available values are   documented as [Product Sort Keys](https://help.shopify.com/api/storefront-api/reference/enum/productsortkeys). |
| [args.query] | <code>String</code> |  | A query string. See full documentation [here](https://help.shopify.com/api/storefront-api/reference/object/shop#products) |
| [args.reverse] | <code>Boolean</code> |  | Whether or not to reverse the sort order of the results |

**Example**  
```js
client.product.fetchQuery({first: 20, sortKey: 'CREATED_AT', reverse: true}).then((products) => {
  // Do something with the first 10 products sorted by title in ascending order
});
```
<a name="ShopResource"></a>

## ShopResource
The JS Buy SDK shop resource

**Kind**: global class  

* [ShopResource](#ShopResource)
    * [.fetchInfo()](#ShopResource+fetchInfo) ⇒ <code>Promise</code> \| <code>GraphModel</code>
    * [.fetchPolicies()](#ShopResource+fetchPolicies) ⇒ <code>Promise</code> \| <code>GraphModel</code>

<a name="ShopResource+fetchInfo"></a>

### shopResource.fetchInfo() ⇒ <code>Promise</code> \| <code>GraphModel</code>
Fetches shop information (`currencyCode`, `description`, `moneyFormat`, `name`, and `primaryDomain`).
See the [Storefront API reference](https://help.shopify.com/api/storefront-api/reference/object/shop) for more information.

**Kind**: instance method of [<code>ShopResource</code>](#ShopResource)  
**Returns**: <code>Promise</code> \| <code>GraphModel</code> - A promise resolving with a `GraphModel` of the shop.  
**Example**  
```js
client.shop.fetchInfo().then((shop) => {
  // Do something with the shop
});
```
<a name="ShopResource+fetchPolicies"></a>

### shopResource.fetchPolicies() ⇒ <code>Promise</code> \| <code>GraphModel</code>
Fetches shop policies (privacy policy, terms of service and refund policy).

**Kind**: instance method of [<code>ShopResource</code>](#ShopResource)  
**Returns**: <code>Promise</code> \| <code>GraphModel</code> - A promise resolving with a `GraphModel` of the shop.  
**Example**  
```js
client.shop.fetchPolicies().then((shop) => {
  // Do something with the shop
});
```
