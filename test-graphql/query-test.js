import assert from 'assert';
import Client from '../src-graphql/client';
import Config from '../src-graphql/config';
import productConnectionQuery from '../src-graphql/product-connection-query';
import collectionConnectionQuery from '../src-graphql/collection-connection-query';
import variantConnectionQuery from '../src-graphql/variant-connection-query';
import optionQuery from '../src-graphql/option-query';
import imageQuery from '../src-graphql/image-query';
import imageConnectionQuery from '../src-graphql/image-connection-query';

suite('query-test', () => {
  const config = new Config({
    domain: 'sendmecats.myshopify.com',
    storefrontAccessToken: 'abc123'
  });

  const client = new Client(config);

  test('it creates product queries with defaults', () => {
    const query = productConnectionQuery();

    assert.equal(query(client.graphQLClient).toString(), 'query { shop { products (first: 20) { pageInfo { hasNextPage,hasPreviousPage },edges { cursor,node { id,createdAt,updatedAt,bodyHtml,handle,productType,title,vendor,tags,publishedAt,options { id,name,values },images (first: 20) { pageInfo { hasNextPage,hasPreviousPage },edges { cursor,node { id,src,altText } } },variants (first: 20) { pageInfo { hasNextPage,hasPreviousPage },edges { cursor,node { id,title,price,weight,selectedOptions { name,value } } } } } } } } }');
  });

  test('it creates product queries with specified fields', () => {
    const query = productConnectionQuery(['id', 'tags', 'vendor', ['images', imageConnectionQuery(['src'])], ['options', optionQuery(['name'])], ['variants', variantConnectionQuery(['id', 'title'])]]);

    assert.equal(query(client.graphQLClient).toString(), 'query { shop { products (first: 20) { pageInfo { hasNextPage,hasPreviousPage },edges { cursor,node { id,tags,vendor,images (first: 20) { pageInfo { hasNextPage,hasPreviousPage },edges { cursor,node { src } } },options { id,name },variants (first: 20) { pageInfo { hasNextPage,hasPreviousPage },edges { cursor,node { id,title } } } } } } } }');
  });

  test('it creates collection queries with defaults', () => {
    const query = collectionConnectionQuery();

    assert.equal(query(client.graphQLClient).toString(), 'query { shop { collections (first: 20) { pageInfo { hasNextPage,hasPreviousPage },edges { cursor,node { id,handle,updatedAt,title,image { id,src,altText } } } } } }');
  });

  test('it creates collection queries with specified fields', () => {
    const query = collectionConnectionQuery(['handle', 'updatedAt', 'title', ['image', imageQuery(['id'])]]);

    assert.equal(query(client.graphQLClient).toString(), 'query { shop { collections (first: 20) { pageInfo { hasNextPage,hasPreviousPage },edges { cursor,node { id,handle,updatedAt,title,image { id } } } } } }');
  });
});
