# Migration guide: JS Buy SDK to Storefront API Client

The JS Buy SDK is deprecated as of January, 2025. We recommend transitioning to the [Storefront API Client](https://github.com/Shopify/shopify-app-js/tree/main/packages/api-clients/storefront-api-client#readme) to leverage the latest cart features and perform more efficient data retrievals.

## Key differences

- The JS Buy SDK includes helper methods (like `fetchByHandle`), which fetch a comprehensive list of fields. Conversely, the Storefront API Client returns only the precise data queried for.
- Both libraries utilize Shopify’s GraphQL Storefront API. However, the JS Buy SDK presents a RESTful-like response, while the Storefront API Client returns a raw `data` object directly derived from the Storefront API itself.
- For pagination, the JS Buy SDK provides helper methods such as `fetchNextPage` and automatically fetches all available product images and variant connections by default. The Storefront API Client requires manual pagination.
- **The JS Buy SDK is deprecated.** The Storefront API Client enables access to globally-deployed [Carts](https://shopify.dev/docs/storefronts/headless/building-with-the-storefront-api/cart/manage), offering improved performance, scalability, and a richer feature set including subscriptions, product bundles, contextual pricing, Shopify Functions, and UI extensions.
- The `imageForSize` helper from JS Buy SDK can be substituted with [image.url transform parameters](https://shopify.dev/docs/api/storefront/2025-01/objects/Image#field-image-url) from the Storefront API Client.

## Migrating

Transitioning from the JS Buy SDK to the Storefront API Client involves a few important steps:

### Step 1: Install the new library

Start by installing the `@Shopify/storefront-api-client` via your preferred package manager:

```bash
npm install @shopify/storefront-api-client
```

### Step 2: Initialize the Client

Transition from the old initialization of the JS Buy SDK:

```js
import Client from "shopify-buy";

const client = Client.buildClient({
  domain: "your-shop-name.myshopify.com",
  storefrontAccessToken: "your-storefront-access-token",
});
```

To the new initialization with the Storefront API Client:

```js
import { createStorefrontApiClient } from "@shopify/storefront-api-client";

const client = createStorefrontApiClient({
  storeDomain: "your-shop-name.myshopify.com",
  publicAccessToken: "your-storefront-public-access-token",
  // apiVersion: '2025-01',
});
```

### Step 3: Convert helper methods to operations

You'll need to transition from using JS Buy SDK helper methods to a more customized design.

#### Fetching products

**JavaScript Buy SDK: Fetching Products**

```js
client.product.fetchAll().then((products) => {
  // Do something with the products
  console.log(products);
});
```

**Storefront API Client: Fetching Products**

```js
const productsQuery = `
  query {
    products(first: 10) {
      edges {
        node {
          id
          handle
          title
          # any other product object fields
        }
      }
    }
  }
`;

const { data, errors, extensions } = await client.request(productsQuery);
console.log(data.products);
```

Note that with the Storefront Client, you'll be crafting GraphQL operations directly, and can therefore customize it according to your needs. Refer to the [Storefront API](https://shopify.dev/docs/api/storefront) documentation for common operations or see <a href="/migration-guide/queries/">JS Buy SDK query equivalents</a>.

#### Carts and checkouts

With the Storefront API Client, you can use the Cart API to create carts and send customers to checkout. [Learn more](https://shopify.dev/docs/storefronts/headless/building-with-the-storefront-api/cart/manage).

```js
const createCartMutation = `mutation createCart($cartInput: CartInput) {
  cartCreate(input: $cartInput) {
    cart {
      id
      checkoutUrl
      lines(first: 10) {
        edges {
          node {
            id
            merchandise {
              ... on ProductVariant {
                id
                title
              }
            }
          }
        }
      }
      cost {
        totalAmount {
          amount
          currencyCode
        }
      }
      # any other cart object fields
    }
  }
}`;

const { data, errors } = await client.request(createCartMutation, {
  variables: {
    cartInput: {
      lines: [
        {
          quantity: 1,
          merchandiseId: "gid://shopify/ProductVariant/43162292814051",
        },
      ],
    },
  },
});

console.log("Checkout URL: ", data.cartCreate.cart.checkoutUrl);
```

#### Pagination

The Storefront API limits how many items can be fetched at once. Results can be paginated [using cursors](https://shopify.dev/docs/api/usage/pagination-graphql). The JS Buy SDK provides helpers like `fetchNextPage`, Storefront API Client requires manual pagination:

```js
const productQuery = `query Products ($numProducts: Int!, $afterCursor: String){
  products(first: $numProducts, after: $afterCursor) {
    nodes {
      id
      title
    }
    pageInfo {
      hasNextPage
      endCursor
    }
  }
}`;

async function paginateThroughProducts() {
  let hasNextPage = true,
    afterCursor = null;

  while (hasNextPage) {
    const {
      data: { products },
      errors,
    } = await client.request(productQuery, {
      variables: { numProducts: 250, afterCursor },
    });

    products.nodes.forEach((product) => {
      console.log(`Product ID: ${product.id}, Name: ${product.title}`);
      // Process each product as needed
    });

    if (products.pageInfo.hasNextPage) {
      afterCursor = products.pageInfo.endCursor;
    } else {
      hasNextPage = false;
    }
  }
}

paginateThroughProducts();
```

#### Resizing images

The JS Buy SDK provides a helper method to resize images. The Storefront API client allows you to do this directly in the query instead.

```js
const query = `{
  productByHandle(handle: "snowboard") {
    id
    thumbnail: featuredImage {
      url(transform: {maxWidth: 100, maxHeight: 100})
    }
  }
}`;

const { data, errors } = await client.request(query);
console.log(data.productByHandle.thumbnail.url);
```

### Step 4: Handle Errors

You may encounter network or GraphQL errors. Be prepared to handle these gracefully:

```js
const { data, errors } = await client.request(query);

if (errors) {
  console.error(errors.message);
  return;
}
```

### Step 5: Test Your Implementation

Ensure to test your new implementation thoroughly to verify that all APIs are working properly and the responses are handled correctly.

## Equivalent queries

During the migration process, it can be helpful to examine the original queries from the JS Buy SDK. We have archived these queries and their optimized versions [here](./queries/).

## Learn more

Check out the [Storefront API Client documentation](https://github.com/Shopify/shopify-app-js/tree/main/packages/api-clients/storefront-api-client#readme) to learn more.
