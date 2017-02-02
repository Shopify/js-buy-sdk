import assert from 'assert';
import Client from '../src-graphql/client';
import Config from '../src-graphql/config';
import productQuery from '../src-graphql/product-query';
import collectionQuery from '../src-graphql/collection-query';
import variantQuery from '../src-graphql/variant-query';
import optionQuery from '../src-graphql/option-query';
import imageQuery from '../src-graphql/image-query';
import imagesQuery from '../src-graphql/images-query';

suite('query-test', () => {
  const config = new Config({
    domain: 'sendmecats.myshopify.com',
    storefrontAccessToken: 'abc123'
  });

  const client = new Client(config);

  test('it creates product queries with defaults', () => {
    const query = productQuery({client: client.graphQLClient});

    assert.equal(query.toString(), 'query { shop { products { pageInfo { hasNextPage,hasPreviousPage },edges { cursor,node { id,createdAt,updatedAt,bodyHtml,handle,productType,title,vendor,tags,publishedAt,options { id,name,values },images (first: 20) { pageInfo { hasNextPage,hasPreviousPage },edges { cursor,node { id,src,altText } } },variants (first: 20) { pageInfo { hasNextPage,hasPreviousPage },edges { cursor,node { id,title,price,weight,selectedOptions { name,value } } } } } } } } }');
  });

  test('it creates product queries with specified fields', () => {
    const query = productQuery({client: client.graphQLClient}, ['id', 'tags', 'vendor', ['images', imagesQuery(['src'])], ['options', optionQuery(['name'])], ['variants', variantQuery(['id', 'title'])]]);

    assert.equal(query.toString(), 'query { shop { products { pageInfo { hasNextPage,hasPreviousPage },edges { cursor,node { id,tags,vendor,images (first: 20) { pageInfo { hasNextPage,hasPreviousPage },edges { cursor,node { src } } },options { id,name },variants (first: 20) { pageInfo { hasNextPage,hasPreviousPage },edges { cursor,node { id,title } } } } } } } }');
  });

  test('it creates collection queries with defaults', () => {
    const query = collectionQuery({client: client.graphQLClient});

    assert.equal(query.toString(), 'query { shop { collections (first: 20) { pageInfo { hasNextPage,hasPreviousPage },edges { cursor,node { id,handle,updatedAt,title,image { id,src,altText } } } } } }');
  });

  test('it creates collection queries with specified fields', () => {
    const query = collectionQuery({client: client.graphQLClient}, ['handle', 'updatedAt', 'title', ['image', imageQuery(['id'])]]);

    assert.equal(query.toString(), 'query { shop { collections (first: 20) { pageInfo { hasNextPage,hasPreviousPage },edges { cursor,node { id,handle,updatedAt,title,image { id } } } } } }');
  });
});
