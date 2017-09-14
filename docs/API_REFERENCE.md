## Classes

<dl>
<dt><a href="#Client">Client</a></dt>
<dd><p>The JS Buy SDK Client.</p>
</dd>
<dt><a href="#Config">Config</a></dt>
<dd><p>The class used to configure the JS Buy SDK Client.</p>
</dd>
</dl>

## Functions

<dl>
<dt><a href="#fetch">fetch(id)</a> ⇒ <code>Promise</code> | <code>GraphModel</code></dt>
<dd><p>Fetches a checkout by ID.</p>
</dd>
<dt><a href="#create">create([input])</a> ⇒ <code>Promise</code> | <code>GraphModel</code></dt>
<dd><p>Creates a checkout.</p>
</dd>
<dt><a href="#addLineItems">addLineItems(checkoutId, lineItems)</a> ⇒ <code>Promise</code> | <code>GraphModel</code></dt>
<dd><p>Adds line items to an existing checkout.</p>
</dd>
<dt><a href="#removeLineItems">removeLineItems(checkoutId, lineItemIds)</a> ⇒ <code>Promise</code> | <code>GraphModel</code></dt>
<dd><p>Removes line items from an existing checkout.</p>
</dd>
<dt><a href="#updateLineItems">updateLineItems(checkoutId, lineItems)</a> ⇒ <code>Promise</code> | <code>GraphModel</code></dt>
<dd><p>Updates line items on an existing checkout.</p>
</dd>
<dt><a href="#fetchAll">fetchAll()</a> ⇒ <code>Promise</code> | <code>Array.&lt;GraphModel&gt;</code></dt>
<dd><p>Fetches all collections on the shop, not including products.
To fetch collections with products use <a href="Client#fetchAllsWithProducts">fetchAllsWithProducts</a>.</p>
</dd>
<dt><a href="#fetchAllWithProducts">fetchAllWithProducts()</a> ⇒ <code>Promise</code> | <code>Array.&lt;GraphModel&gt;</code></dt>
<dd><p>Fetches all collections on the shop, including products.</p>
</dd>
<dt><a href="#fetch">fetch(id)</a> ⇒ <code>Promise</code> | <code>GraphModel</code></dt>
<dd><p>Fetches a single collection by ID on the shop, not including products.
To fetch the collection with products use <a href="Client#fetchWithProducts">fetchWithProducts</a>.</p>
</dd>
<dt><a href="#fetchWithProducts">fetchWithProducts(id)</a> ⇒ <code>Promise</code> | <code>GraphModel</code></dt>
<dd><p>Fetches a single collection by ID on the shop, including products.</p>
</dd>
<dt><a href="#fetchByHandle">fetchByHandle(handle)</a> ⇒ <code>Promise</code> | <code>GraphModel</code></dt>
<dd><p>Fetches a collection by handle on the shop.</p>
</dd>
<dt><a href="#fetchQuery">fetchQuery([args])</a> ⇒ <code>Promise</code> | <code>Array.&lt;GraphModel&gt;</code></dt>
<dd><p>Fetches all collections on the shop that match the query.</p>
</dd>
<dt><a href="#fetchAll">fetchAll([pageSize])</a> ⇒ <code>Promise</code> | <code>Array.&lt;GraphModel&gt;</code></dt>
<dd><p>Fetches all products on the shop.</p>
</dd>
<dt><a href="#fetch">fetch(id)</a> ⇒ <code>Promise</code> | <code>GraphModel</code></dt>
<dd><p>Fetches a single product by ID on the shop.</p>
</dd>
<dt><a href="#fetchByHandle">fetchByHandle(handle)</a> ⇒ <code>Promise</code> | <code>GraphModel</code></dt>
<dd><p>Fetches a single product by handle on the shop.</p>
</dd>
<dt><a href="#fetchQuery">fetchQuery([args])</a> ⇒ <code>Promise</code> | <code>Array.&lt;GraphModel&gt;</code></dt>
<dd><p>Fetches all products on the shop that match the query.</p>
</dd>
<dt><a href="#fetchInfo">fetchInfo()</a> ⇒ <code>Promise</code> | <code>GraphModel</code></dt>
<dd><p>Fetches shop information (<code>currencyCode</code>, <code>description</code>, <code>moneyFormat</code>, <code>name</code>, and <code>primaryDomain</code>).
See the <a href="https://help.shopify.com/api/storefront-api/reference/object/shop">Storefront API reference</a> for more information.</p>
</dd>
<dt><a href="#fetchPolicies">fetchPolicies()</a> ⇒ <code>Promise</code> | <code>GraphModel</code></dt>
<dd><p>Fetches shop policies (privacy policy, terms of service and refund policy).</p>
</dd>
</dl>

<a name="Client"></a>

## Client
The JS Buy SDK Client.

**Kind**: global class  
**Properties**

| Name | Type | Description |
| --- | --- | --- |
| product | <code>Object</code> | The property under which product fetching methods live. |
| collection | <code>Object</code> | The property under which collection fetching methods live. |
| shop | <code>Object</code> | The property under which shop fetching methods live. |
| checkout | <code>Object</code> | The property under which shop fetching and mutating methods live. |
| image | <code>Object</code> | The property under which image helper methods live. |


* [Client](#Client)
    * [new Client(config)](#new_Client_new)
    * [.buildClient()](#Client.buildClient)

<a name="new_Client_new"></a>

### new Client(config)

| Param | Type | Description |
| --- | --- | --- |
| config | <code>[Config](#Config)</code> | An instance of [Config](#Config) used to configure the Client. |

<a name="Client.buildClient"></a>

### Client.buildClient()
Primary entry point for building a new Client.

**Kind**: static method of <code>[Client](#Client)</code>  
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

<a name="fetch"></a>

## fetch(id) ⇒ <code>Promise</code> \| <code>GraphModel</code>
Fetches a checkout by ID.

**Kind**: global function  
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
<a name="create"></a>

## create([input]) ⇒ <code>Promise</code> \| <code>GraphModel</code>
Creates a checkout.

**Kind**: global function  
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
<a name="addLineItems"></a>

## addLineItems(checkoutId, lineItems) ⇒ <code>Promise</code> \| <code>GraphModel</code>
Adds line items to an existing checkout.

**Kind**: global function  
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
<a name="removeLineItems"></a>

## removeLineItems(checkoutId, lineItemIds) ⇒ <code>Promise</code> \| <code>GraphModel</code>
Removes line items from an existing checkout.

**Kind**: global function  
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
<a name="updateLineItems"></a>

## updateLineItems(checkoutId, lineItems) ⇒ <code>Promise</code> \| <code>GraphModel</code>
Updates line items on an existing checkout.

**Kind**: global function  
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
<a name="fetchAll"></a>

## fetchAll() ⇒ <code>Promise</code> \| <code>Array.&lt;GraphModel&gt;</code>
Fetches all collections on the shop, not including products.
To fetch collections with products use [fetchAllsWithProducts](Client#fetchAllsWithProducts).

**Kind**: global function  
**Returns**: <code>Promise</code> \| <code>Array.&lt;GraphModel&gt;</code> - A promise resolving with an array of `GraphModel`s of the collections.  
**Example**  
```js
client.collection.fetchAll().then((collections) => {
  // Do something with the collections
});
```
<a name="fetchAllWithProducts"></a>

## fetchAllWithProducts() ⇒ <code>Promise</code> \| <code>Array.&lt;GraphModel&gt;</code>
Fetches all collections on the shop, including products.

**Kind**: global function  
**Returns**: <code>Promise</code> \| <code>Array.&lt;GraphModel&gt;</code> - A promise resolving with an array of `GraphModel`s of the collections.  
**Example**  
```js
client.collection.fetchAllWithProducts().then((collections) => {
  // Do something with the collections
});
```
<a name="fetch"></a>

## fetch(id) ⇒ <code>Promise</code> \| <code>GraphModel</code>
Fetches a single collection by ID on the shop, not including products.
To fetch the collection with products use [fetchWithProducts](Client#fetchWithProducts).

**Kind**: global function  
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
<a name="fetchWithProducts"></a>

## fetchWithProducts(id) ⇒ <code>Promise</code> \| <code>GraphModel</code>
Fetches a single collection by ID on the shop, including products.

**Kind**: global function  
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
<a name="fetchByHandle"></a>

## fetchByHandle(handle) ⇒ <code>Promise</code> \| <code>GraphModel</code>
Fetches a collection by handle on the shop.

**Kind**: global function  
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
<a name="fetchQuery"></a>

## fetchQuery([args]) ⇒ <code>Promise</code> \| <code>Array.&lt;GraphModel&gt;</code>
Fetches all collections on the shop that match the query.

**Kind**: global function  
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
<a name="fetchAll"></a>

## fetchAll([pageSize]) ⇒ <code>Promise</code> \| <code>Array.&lt;GraphModel&gt;</code>
Fetches all products on the shop.

**Kind**: global function  
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
<a name="fetch"></a>

## fetch(id) ⇒ <code>Promise</code> \| <code>GraphModel</code>
Fetches a single product by ID on the shop.

**Kind**: global function  
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
<a name="fetchByHandle"></a>

## fetchByHandle(handle) ⇒ <code>Promise</code> \| <code>GraphModel</code>
Fetches a single product by handle on the shop.

**Kind**: global function  
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
<a name="fetchQuery"></a>

## fetchQuery([args]) ⇒ <code>Promise</code> \| <code>Array.&lt;GraphModel&gt;</code>
Fetches all products on the shop that match the query.

**Kind**: global function  
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
<a name="fetchInfo"></a>

## fetchInfo() ⇒ <code>Promise</code> \| <code>GraphModel</code>
Fetches shop information (`currencyCode`, `description`, `moneyFormat`, `name`, and `primaryDomain`).
See the [Storefront API reference](https://help.shopify.com/api/storefront-api/reference/object/shop) for more information.

**Kind**: global function  
**Returns**: <code>Promise</code> \| <code>GraphModel</code> - A promise resolving with a `GraphModel` of the shop.  
**Example**  
```js
client.shop.fetchInfo().then((shop) => {
  // Do something with the shop
});
```
<a name="fetchPolicies"></a>

## fetchPolicies() ⇒ <code>Promise</code> \| <code>GraphModel</code>
Fetches shop policies (privacy policy, terms of service and refund policy).

**Kind**: global function  
**Returns**: <code>Promise</code> \| <code>GraphModel</code> - A promise resolving with a `GraphModel` of the shop.  
**Example**  
```js
client.shop.fetchPolicies().then((shop) => {
  // Do something with the shop
});
```
