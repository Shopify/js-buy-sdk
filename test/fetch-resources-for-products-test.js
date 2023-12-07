import assert from 'assert';
import fetchResourcesForProducts from '../src/fetch-resources-for-products';

suite('fetch-resources-for-product-test', () => {
  test('it returns an empty array when no product is found', () => {
    return fetchResourcesForProducts(null).then((result) => {

      assert.deepStrictEqual(result, []);
    });
  });

  test('it fetches all pages of images and for a single product', () => {
    const imagesArray = ['images'];
    const variantsArray = ['variants'];
    const metafieldsWithReferenceListArray = ['metafieldsWithReferenceList'];
    const fixture = {
      images: imagesArray,
      variants: variantsArray,
      metafieldsWithReferenceList: metafieldsWithReferenceListArray,
      attrs: {
        images: imagesArray,
        variants: variantsArray,
        metafieldsWithReferenceList: metafieldsWithReferenceListArray
      }
    };
    let fetchAllPagesCounter = 0;
    const itemsList = [];

    const client = {
      fetchAllPages(items) {
        fetchAllPagesCounter++;
        itemsList.push(items);

        return Promise.resolve(['reassigned-array']);
      }
    };

    return fetchResourcesForProducts(fixture, client).then(() => {
      assert.equal(fetchAllPagesCounter, 3);
      assert.deepEqual(fixture.attrs.images, ['reassigned-array']);
      assert.deepEqual(fixture.attrs.variants, ['reassigned-array']);
      assert.deepEqual(fixture.attrs.metafieldsWithReferenceList, ['reassigned-array']);
    });
  });

  test('it fetches all pages of images and for an array of products', () => {
    const imagesArray = ['images'];
    const variantsArray = ['variants'];
    const metafieldsWithReferenceListArray = ['metafieldsWithReferenceList'];
    const fixture = {
      images: imagesArray,
      variants: variantsArray,
      metafieldsWithReferenceList: metafieldsWithReferenceListArray,
      attrs: {
        images: imagesArray,
        variants: variantsArray,
        metafieldsWithReferenceList: metafieldsWithReferenceListArray
      }
    };
    let fetchAllPagesCounter = 0;
    const itemsList = [];

    const client = {
      fetchAllPages(items) {
        fetchAllPagesCounter++;
        itemsList.push(items);

        return Promise.resolve(['reassigned-array']);
      }
    };

    return fetchResourcesForProducts([fixture], client).then(() => {
      assert.equal(fetchAllPagesCounter, 3);
      assert.deepEqual(fixture.attrs.images, ['reassigned-array']);
      assert.deepEqual(fixture.attrs.variants, ['reassigned-array']);
      assert.deepEqual(fixture.attrs.metafieldsWithReferenceList, ['reassigned-array']);
    });
  });
});
