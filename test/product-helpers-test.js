import assert from 'assert';
import GraphQLJSClient, {decode} from 'graphql-js-client';
import productNodeQuery from '../src/graphql/productNodeQuery.graphql';
import productHelpers from '../src/product-helpers';
import singleProductFixture from '../fixtures/product-fixture';
import types from '../schema.json';

suite('product-helpers-test', () => {
  const graphQLClient = new GraphQLJSClient(types, {url: 'https://sendmecats.myshopify.com/api/2019-07/graphql'});
  const query = productNodeQuery(graphQLClient)
    .definitions
    .find((definition) => definition.operationType === 'query');

  const productModel = decode(query, singleProductFixture.data);

  test('it returns the variant based on options given', () => {
    const variant = productHelpers.variantForOptions(productModel.node, {Fur: 'Fluffy', Size: 'Medium'});

    assert.equal(variant.id, 'Z2lkOi8vc2hvcGlmeS9Qcm9kdWN0Lzc4NTc5ODkzODQ=');
  });

  test('it returns undefined if the variant does not exist', () => {
    const variant = productHelpers.variantForOptions(productModel.node, {Fur: 'Fluffy', Size: 'Small'});

    assert.equal(typeof variant, 'undefined');
  });
});
