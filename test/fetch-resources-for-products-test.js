import assert from 'assert';
import fetchResourcesForProducts from '../src/fetch-resources-for-products';

suite('fetch-resources-for-product-test', () => {
  test('it returns null when no product is found', () => {
    const fixture = null;

    return fetchResourcesForProducts(fixture).then((result) => {

      assert.deepStrictEqual(result, [null]);
    });
  });

  test('it fetches all pages of images and for a single product', () => {
    const imagesArray = ['images'];
    const variantsArray = ['variants'];
    const fixture = {
      images: imagesArray,
      variants: variantsArray,
      attrs: {
        images: imagesArray,
        variants: variantsArray
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
      assert.equal(fetchAllPagesCounter, 2);
      assert.deepEqual(fixture.attrs.images, ['reassigned-array']);
      assert.deepEqual(fixture.attrs.variants, ['reassigned-array']);
    });
  });

  test('it fetches all pages of images and for an array of products', () => {
    const imagesArray = ['images'];
    const variantsArray = ['variants'];
    const fixture = {
      images: imagesArray,
      variants: variantsArray,
      attrs: {
        images: imagesArray,
        variants: variantsArray
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
      assert.equal(fetchAllPagesCounter, 2);
      assert.deepEqual(fixture.attrs.images, ['reassigned-array']);
      assert.deepEqual(fixture.attrs.variants, ['reassigned-array']);
    });
  });
});
