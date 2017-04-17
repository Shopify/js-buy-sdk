import assert from 'assert';
import imageHelpers from '../src/image-helpers';

suite('image-helpers-test', () => {
  test('it returns the image src with the specified width and height', () => {
    const resizedImageSrc = imageHelpers.imageForSize({src: 'https://cdn.shopify.com/s/files/1/1510/7238/products/cat.jpg?v=1489515038'}, {maxWidth: 30, maxHeight: 30});

    assert.equal(resizedImageSrc, 'https://cdn.shopify.com/s/files/1/1510/7238/products/cat_30x30.jpg?v=1489515038');
  });

  test('it returns the correct url for filenames with .', () => {
    const resizedImageSrc = imageHelpers.imageForSize({src: 'https://cdn.shopify.com/s/files/1/1510/7238/products/cat.really.big.jpg?v=1489515038'}, {maxWidth: 30, maxHeight: 30});

    assert.equal(resizedImageSrc, 'https://cdn.shopify.com/s/files/1/1510/7238/products/cat.really.big_30x30.jpg?v=1489515038');
  });

  test('it returns the correct url for an image src with . in the query param', () => {
    const resizedImageSrc = imageHelpers.imageForSize({src: 'https://cdn.shopify.com/s/files/1/1510/7238/products/cat.jpg?v=1.489.51.5038'}, {maxWidth: 30, maxHeight: 30});

    assert.equal(resizedImageSrc, 'https://cdn.shopify.com/s/files/1/1510/7238/products/cat_30x30.jpg?v=1.489.51.5038');
  });
});
