import GraphQLJSClient from './graphql-client';
import types from '../types';
import productNodeQuery from './product-node-query';
import productConnectionQuery from './product-connection-query';
import collectionNodeQuery, {defaultFields as collectionDefaultFields} from './collection-node-query';
import collectionConnectionQuery from './collection-connection-query';
import checkoutQuery, {checkoutNodeQuery} from './checkout-query';
import customAttributeQuery from './custom-attribute-query';
import imageConnectionQuery from './image-connection-query';
import imageQuery from './image-query';
import lineItemConnectionQuery from './line-item-connection-query';
import mailingAddressQuery from './mailing-address-query';
import optionQuery from './option-query';
import orderQuery from './order-query';
import selectedOptionQuery from './selected-option-query';
import shippingRateQuery from './shipping-rate-query';
import variantConnectionQuery from './variant-connection-query';
import variantQuery from './variant-query';
import shopQuery from './shop-query';
import shopPolicyQuery from './shop-policy-query';
import productHelpers from './product-helpers';
import imageHelpers from './image-helpers';
import {version} from '../package.json';

export {default as Config} from './config';

function checkoutMutation(type, input, query, client) {
  const mutation = client.mutation((root) => {
    root.add(type, {args: input}, (checkoutMutationField) => {
      checkoutMutationField.add('userErrors', (userErrors) => {
        userErrors.add('message');
        userErrors.add('field');
      });
      query(checkoutMutationField, 'checkout');
    });
  });

  return client.send(mutation).then((result) => {
    const userErrors = result.data[type].userErrors;

    if (userErrors.length) {
      return Promise.reject(new Error(JSON.stringify(userErrors)));
    }

    return client.fetchAllPages(result.model[type].checkout.lineItems, {pageSize: 250}).then((lineItems) => {
      result.model[type].checkout.attrs.lineItems = lineItems;

      return result.model[type].checkout;
    });
  });
}

function fetchResourcesForProducts(products, client) {
  return products.reduce((promiseAcc, product) => {
    // Fetch the rest of the images and variants for this product
    promiseAcc.push(client.fetchAllPages(product.images, {pageSize: 250}).then((images) => {
      product.attrs.images = images;
    }));

    promiseAcc.push(client.fetchAllPages(product.variants, {pageSize: 250}).then((variants) => {
      product.attrs.variants = variants;
    }));

    return promiseAcc;
  }, []);
}

/**
 * The JS Buy SDK Client.
 * @class
 */
class Client {

  /**
   * A namespace providing utilities for product resources.
   * @namespace
   */
  static get Product() {
    return {
      Helpers: productHelpers
    };
  }

  /**
   * A namespace providing utilities for image resources.
   * @namespace
   */
  static get Image() {
    return {
      Helpers: imageHelpers
    };
  }

  /**
   * A namespace providing the functions used to build different kinds of queries.
   * @namespace
   */
  static get Queries() {
    return {
      productNodeQuery,
      productConnectionQuery,
      collectionNodeQuery,
      collectionConnectionQuery,
      checkoutQuery,
      customAttributeQuery,
      imageConnectionQuery,
      imageQuery,
      lineItemConnectionQuery,
      mailingAddressQuery,
      optionQuery,
      orderQuery,
      selectedOptionQuery,
      shippingRateQuery,
      variantConnectionQuery,
      variantQuery,
      checkoutNodeQuery
    };
  }

  /**
   * @constructs Client
   * @param {Config} config An instance of {@link Config} used to configure the Client.
   */
  constructor(config, GraphQLClientClass = GraphQLJSClient) {
    const apiUrl = `https://${config.domain}/api/graphql`;

    this.graphQLClient = new GraphQLClientClass(types, {
      url: apiUrl,
      fetcherOptions: {
        headers: {
          'X-SDK-Variant': 'javascript',
          'X-SDK-Version': version,
          'X-Shopify-Storefront-Access-Token': config.storefrontAccessToken
        }
      }
    });
  }

  /**
   * Fetches shop information (`currencyCode`, `description`, `moneyFormat`, `name`, and `primaryDomain`).
   * See the {@link https://help.shopify.com/api/storefront-api/reference/object/shop|Storefront API reference} for more information.
   *
   * @example
   * client.fetchShopInfo().then((shop) => {
   *   // Do something with the shop
   * });
   *
   * @return {Promise|GraphModel} A promise resolving with a `GraphModel` of the shop.
   */
  fetchShopInfo() {
    const query = shopQuery();
    const rootQuery = this.graphQLClient.query((root) => {
      query(root, 'shop');
    });

    return this.graphQLClient.send(rootQuery).then((result) => {
      return result.model.shop;
    });
  }

  /**
   * Fetches shop policies (privacy policy, terms of service and refund policy).
   *
   * @example
   * client.fetchShopPolicies().then((shop) => {
   *   // Do something with the shop
   * });
   *
   * @return {Promise|GraphModel} A promise resolving with a `GraphModel` of the shop.
   */
  fetchShopPolicies() {
    const query = shopQuery([
      ['privacyPolicy', shopPolicyQuery()],
      ['termsOfService', shopPolicyQuery()],
      ['refundPolicy', shopPolicyQuery()]
    ]);
    const rootQuery = this.graphQLClient.query((root) => {
      query(root, 'shop');
    });

    return this.graphQLClient.send(rootQuery).then((result) => {
      return result.model.shop;
    });
  }

  /**
   * Fetches all products on the shop.
   *
   * @example
   * client.fetchAllProducts().then((products) => {
   *   // Do something with the products
   * });
   *
   * @param {Client.Queries.productConnectionQuery} [query] Callback function to specify fields to query on the products.
   * @return {Promise|GraphModel[]} A promise resolving with an array of `GraphModel`s of the products.
   */
  fetchAllProducts(query = productConnectionQuery()) {
    const rootQuery = this.graphQLClient.query((root) => {
      root.add('shop', (shop) => {
        query(shop, 'products');
      });
    });

    return this.graphQLClient.send(rootQuery).then(({model}) => {
      return Promise.all(fetchResourcesForProducts(model.shop.products, this.graphQLClient)).then(() => {
        return model.shop.products;
      });
    });
  }

  /**
   * Fetches a single product by ID on the shop.
   *
   * @example
   * client.fetchProduct('123456').then((product) => {
   *   // Do something with the product
   * });
   *
   * @param {String} id The id of the product to fetch.
   * @param {Client.Queries.productNodeQuery} [query] Callback function to specify fields to query on the product.
   * @return {Promise|GraphModel} A promise resolving with a `GraphModel` of the product.
   */
  fetchProduct(id, query = productNodeQuery()) {
    const rootQuery = this.graphQLClient.query((root) => {
      query(root, 'node', id);
    });

    return this.graphQLClient.send(rootQuery).then(({model}) => {
      const promises = [];

      promises.push(this.graphQLClient.fetchAllPages(model.node.images, {pageSize: 250}).then((images) => {
        model.node.attrs.images = images;
      }));

      promises.push(this.graphQLClient.fetchAllPages(model.node.variants, {pageSize: 250}).then((variants) => {
        model.node.attrs.variants = variants;
      }));

      return Promise.all(promises).then(() => {
        return model.node;
      });
    });
  }

  /**
   * Fetches all collections on the shop, not including products.
   * To fetch collections with products use [fetchAllCollectionsWithProducts]{@link Client#fetchAllCollectionsWithProducts}.
   *
   * @example
   * client.fetchAllCollections().then((collections) => {
   *   // Do something with the collections
   * });
   *
   * @param {Client.Queries.collectionConnectionQuery} [query] Callback function to specify fields to query on the collections.
   * @return {Promise|GraphModel[]} A promise resolving with an array of `GraphModel`s of the collections.
   */
  fetchAllCollections(query = collectionConnectionQuery()) {
    const rootQuery = this.graphQLClient.query((root) => {
      root.add('shop', (shop) => {
        query(shop, 'collections');
      });
    });

    return this.graphQLClient.send(rootQuery).then((response) => {
      return response.model.shop.collections;
    });
  }

  /**
   * Fetches all collections on the shop, including products.
   *
   * @example
   * client.fetchAllCollectionsWithProducts().then((collections) => {
   *   // Do something with the collections
   * });
   *
   * @return {Promise|GraphModel[]} A promise resolving with an array of `GraphModel`s of the collections.
   */
  fetchAllCollectionsWithProducts() {
    const query = collectionConnectionQuery([...collectionDefaultFields, ['products', productConnectionQuery()]]);
    const rootQuery = this.graphQLClient.query((root) => {
      root.add('shop', (shop) => {
        query(shop, 'collections');
      });
    });

    return this.graphQLClient.send(rootQuery).then(({model}) => {
      const promises = model.shop.collections.reduce((promiseAcc, collection) => {
        return fetchResourcesForProducts(collection.products, this.graphQLClient);
      }, []);

      return Promise.all(promises).then(() => {
        return model.shop.collections;
      });
    });
  }

  /**
   * Fetches a single collection by ID on the shop, not including products.
   * To fetch the collection with products use [fetchCollectionWithProducts]{@link Client#fetchCollectionWithProducts}.
   *
   * @example
   * client.fetchCollection('123456').then((collection) => {
   *   // Do something with the collection
   * });
   *
   * @param {String} id The id of the collection to fetch.
   * @param {Client.Queries.collectionNodeQuery} [query] Callback function to specify fields to query on the collection.
   * @return {Promise|GraphModel} A promise resolving with a `GraphModel` of the collection.
   */
  fetchCollection(id, query = collectionNodeQuery()) {
    const rootQuery = this.graphQLClient.query((root) => {
      query(root, 'node', id);
    });

    return this.graphQLClient.send(rootQuery).then((response) => {
      return response.model.node;
    });
  }

  /**
   * Fetches a single collection by ID on the shop, including products.
   *
   * @example
   * client.fetchCollectionWithProducts('123456').then((collection) => {
   *   // Do something with the collection
   * });
   *
   * @param {String} id The id of the collection to fetch.
   * @return {Promise|GraphModel} A promise resolving with a `GraphModel` of the collection.
   */
  fetchCollectionWithProducts(id) {
    const query = collectionNodeQuery([...collectionDefaultFields, ['products', productConnectionQuery()]]);
    const rootQuery = this.graphQLClient.query((root) => {
      query(root, 'node', id);
    });

    return this.graphQLClient.send(rootQuery).then(({model}) => {
      return Promise.all(fetchResourcesForProducts(model.node.products, this.graphQLClient)).then(() => {
        return model.node;
      });
    });
  }

  /**
   * Fetches a checkout by ID.
   *
   * @example
   * client.fetchCheckout('123456').then((checkout) => {
   *   // Do something with the checkout
   * });
   *
   * @param {String} id The id of the checkout to fetch.
   * @param {Client.Queries.checkoutNodeQuery} [query] Callback function to specify fields to query on the checkout.
   * @return {Promise|GraphModel} A promise resolving with a `GraphModel` of the checkout.
   */
  fetchCheckout(id, query = checkoutNodeQuery()) {
    const rootQuery = this.graphQLClient.query((root) => {
      query(root, 'node', id);
    });

    return this.graphQLClient.send(rootQuery).then((response) => {
      return response.model.node;
    });
  }

  /**
   * Fetches all products on the shop that match the query.
   *
   * @example
   * client.fetchQueryProducts({sortBy: 'title', limit: 10}).then((products) => {
   *   // Do something with the first 10 products sorted by title in ascending order
   * });
   *
   * @param {Object} [queryObject] An object specifying the query data containing zero or more of:
   *   @param {String} [queryObject.title] The title of the product to fetch.
   *   @param {String} [queryObject.updatedAtMin] Products updated since the supplied timestamp (format: `2016-09-25T21:31:33`).
   *   @param {String} [queryObject.createdAtMin] Products created since the supplied timestamp (format: `2016-09-25T21:31:33`).
   *   @param {String} [queryObject.productType] The type of products to fetch.
   *   @param {Number} [queryObject.limit] The number of products to fetch.
   *   @param {String} [queryObject.sortBy] The field to use to sort products. Possible values are `title`, `updatedAt`, and `createdAt`.
   *   @param {String} [queryObject.sortDirection] The sort direction of the products.
   *     Will sort products by ascending order unless `'desc'` is specified.
   * @param {Client.Queries.productConnectionQuery} [query] Callback function to specify fields to query on the products.
   * @return {Promise|GraphModel[]} A promise resolving with an array of `GraphModel`s of the products.
   */
  fetchQueryProducts(queryObject = {}, query = productConnectionQuery()) {
    const queryArgStrings = [];
    const options = {};

    if (queryObject.title) {
      queryArgStrings.push(`title:'${queryObject.title}'`);
    }
    if (queryObject.updatedAtMin) {
      queryArgStrings.push(`updated_at:>='${queryObject.updatedAtMin}'`);
    }
    if (queryObject.createdAtMin) {
      queryArgStrings.push(`created_at:>='${queryObject.createdAtMin}'`);
    }
    if (queryObject.productType) {
      queryArgStrings.push(`product_type:'${queryObject.productType}'`);
    }
    if (queryObject.limit) {
      options.first = queryObject.limit;
    }
    if (queryObject.sortBy) {
      let sortKey;

      switch (queryObject.sortBy) {
        case 'title':
          sortKey = this.graphQLClient.enum('TITLE');
          break;
        case 'updatedAt':
          sortKey = this.graphQLClient.enum('UPDATED_AT');
          break;
        case 'createdAt':
          sortKey = this.graphQLClient.enum('CREATED_AT');
          break;
      }

      options.sortKey = sortKey;
    }
    if (queryObject.sortDirection === 'desc') {
      options.reverse = true;
    }

    options.query = queryArgStrings.join(' ');

    const rootQuery = this.graphQLClient.query((root) => {
      root.add('shop', (shop) => {
        query(shop, 'products', options);
      });
    });

    return this.graphQLClient.send(rootQuery).then(({model}) => {
      const promises = model.shop.products.reduce((promiseAcc, product) => {
        // Fetch the rest of the images and variants for this product
        promiseAcc.push(this.graphQLClient.fetchAllPages(product.images, {pageSize: 250}).then((images) => {
          product.attrs.images = images;
        }));

        promiseAcc.push(this.graphQLClient.fetchAllPages(product.variants, {pageSize: 250}).then((variants) => {
          product.attrs.variants = variants;
        }));

        return promiseAcc;
      }, []);

      return Promise.all(promises).then(() => {
        return model.shop.products;
      });
    });
  }

  /**
   * Fetches all collections on the shop that match the query.
   *
   * @example
   * client.fetchQueryCollections({sortBy: 'title', limit: 10}).then((collections) => {
   *   // Do something with the first 10 collections sorted by title in ascending order
   * });
   *
   * @param {Object} [queryObject] An object specifying the query data containing zero or more of:
   *   @param {String} [queryObject.title] The title of the collection to fetch.
   *   @param {String} [queryObject.updatedAtMin] Collections updated since the supplied timestamp (format: `2016-09-25T21:31:33`).
   *   @param {Number} [queryObject.limit] The number of collections to fetch.
   *   @param {String} [queryObject.sortBy] The field to use to sort collections. Possible values are `title` and `updatedAt`.
   *   @param {String} [queryObject.sortDirection] The sort direction of the collections.
   *     Will sort collections by ascending order unless `'desc'` is specified.
   * @param {Client.Queries.collectionConnectionQuery} [query] Callback function to specify fields to query on the collections.
   * @return {Promise|GraphModel[]} A promise resolving with an array of `GraphModel`s of the collections.
   */
  fetchQueryCollections(queryObject = {}, query = collectionConnectionQuery()) {
    const queryArgStrings = [];
    const options = {};

    if (queryObject.title) {
      queryArgStrings.push(`title:'${queryObject.title}'`);
    }
    if (queryObject.updatedAtMin) {
      queryArgStrings.push(`updated_at:>='${queryObject.updatedAtMin}'`);
    }
    if (queryObject.limit) {
      options.first = queryObject.limit;
    }
    if (queryObject.sortBy) {
      let sortKey;

      switch (queryObject.sortBy) {
        case 'title':
          sortKey = this.graphQLClient.enum('TITLE');
          break;
        case 'updatedAt':
          sortKey = this.graphQLClient.enum('UPDATED_AT');
          break;
      }

      options.sortKey = sortKey;
    }
    if (queryObject.sortDirection === 'desc') {
      options.reverse = true;
    }

    options.query = queryArgStrings.join(' ');

    const rootQuery = this.graphQLClient.query((root) => {
      root.add('shop', (shop) => {
        query(shop, 'collections', options);
      });
    });

    return this.graphQLClient.send(rootQuery).then((response) => {
      return response.model.shop.collections;
    });
  }

  /**
   * Creates a checkout.
   *
   * @example
   * const input = {
   *   lineItems: [
   *     {variantId: 'gid://shopify/ProductVariant/2', quantity: 5}
   *   ]
   * };
   *
   * client.createCheckout(input).then((checkout) => {
   *   // Do something with the newly created checkout
   * });
   *
   * @param {Object} [input] An input object containing zero or more of:
   *   @param {String} [input.email] An email connected to the checkout.
   *   @param {Object[]} [input.lineItems] A list of line items in the checkout. See the {@link https://help.shopify.com/api/storefront-api/reference/input_object/checkoutlineiteminput|Storefront API reference} for valid input fields for each line item.
   *   @param {Object} [input.shippingAddress] A shipping address. See the {@link https://help.shopify.com/api/storefront-api/reference/input_object/mailingaddressinput|Storefront API reference} for valid input fields.
   *   @param {String} [input.note] A note for the checkout.
   *   @param {Object[]} [input.customAttributes] A list of custom attributes for the checkout. See the {@link https://help.shopify.com/api/storefront-api/reference/input_object/attributeinput|Storefront API reference} for valid input fields.
   * @param {Client.Queries.checkoutQuery} [query] Callback function to specify fields to query on the checkout returned.
   * @return {Promise|GraphModel} A promise resolving with the created checkout.
   */
  createCheckout(input = {}, query = checkoutQuery()) {
    return checkoutMutation('checkoutCreate', {input}, query, this.graphQLClient);
  }

  /**
   * Adds line items to an existing checkout.
   *
   * @example
   * const checkoutId = 'gid://shopify/Checkout/abc123';
   * const lineItems = [{variantId: 'gid://shopify/ProductVariant/2', quantity: 5}];
   *
   * client.addLineItems(checkoutId, lineItems).then((checkout) => {
   *   // Do something with the updated checkout
   * });
   *
   * @param {String} checkoutId The ID of the checkout to add line items to.
   * @param {Object[]} lineItems A list of line items to add to the checkout. See the {@link https://help.shopify.com/api/storefront-api/reference/input_object/checkoutlineiteminput|Storefront API reference} for valid input fields for each line item.
   * @param {Client.Queries.checkoutQuery} [query] Callback function to specify fields to query on the checkout returned.
   * @return {Promise|GraphModel} A promise resolving with the updated checkout.
   */
  addLineItems(checkoutId, lineItems, query = checkoutQuery()) {
    return checkoutMutation('checkoutLineItemsAdd', {checkoutId, lineItems}, query, this.graphQLClient);
  }

  /**
   * Removes line items from an existing checkout.
   *
   * @example
   * const checkoutId = 'gid://shopify/Checkout/abc123';
   * const lineItemIds = ['gid://shopify/CheckoutLineItem/def456'];
   *
   * client.removeLineItems(checkoutId, lineItemIds).then((checkout) => {
   *   // Do something with the updated checkout
   * });
   *
   * @param {String} checkoutId The ID of the checkout to remove line items from.
   * @param {String[]} lineItemIds A list of the ids of line items to remove from the checkout.
   * @param {Client.Queries.checkoutQuery} [query] Callback function to specify fields to query on the checkout returned.
   * @return {Promise|GraphModel} A promise resolving with the updated checkout.
   */
  removeLineItems(checkoutId, lineItemIds, query = checkoutQuery()) {
    return checkoutMutation('checkoutLineItemsRemove', {checkoutId, lineItemIds}, query, this.graphQLClient);
  }

  /**
   * Updates line items on an existing checkout.
   *
   * @example
   * const checkoutId = 'gid://shopify/Checkout/abc123';
   * const lineItems = [
   *   {
   *     id: 'gid://shopify/CheckoutLineItem/def456',
   *     quantity: 5,
   *     variantId: 'gid://shopify/ProductVariant/2'
   *   }
   * ];
   *
   * client.updateLineItems(checkoutId, lineItems).then(checkout => {
   *   // Do something with the updated checkout
   * });
   *
   * @param {String} checkoutId The ID of the checkout to update a line item on.
   * @param {Object[]} lineItems A list of line item information to update. See the {@link https://help.shopify.com/api/storefront-api/reference/input_object/checkoutlineitemupdateinput|Storefront API reference} for valid input fields for each line item.
   * @param {Client.Queries.checkoutQuery} [query] Callback function to specify fields to query on the checkout returned.
   * @return {Promise|GraphModel} A promise resolving with the updated checkout.
   */
  updateLineItems(checkoutId, lineItems, query = checkoutQuery()) {
    return checkoutMutation('checkoutLineItemsUpdate', {checkoutId, lineItems}, query, this.graphQLClient);
  }
}

export default Client;
