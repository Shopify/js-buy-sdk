import assert from 'assert';
import imageHelpers from '../src/image-helpers';

suite('image-helpers-test', () => {
  test('it returns the image src with the specified width and height', () => {
    const resizedImageSrc = imageHelpers.imageForSize({src: 'https://cdn.shopify.com/s/files/1/1019/0495/products/babyandco5.jpg?v=1487171332'}, {maxWidth: 280, maxHeight: 560});

    assert.equal(resizedImageSrc, 'https://cdn.shopify.com/s/files/1/1019/0495/products/babyandco5_280x560.jpg?v=1487171332');
  });

  test('it returns the correct url for an image without any url params', () => {
    const resizedImageSrc = imageHelpers.imageForSize({src: 'https://cdn.shopify.com/s/files/1/1019/0495/products/babyandco5.jpg'}, {maxWidth: 280, maxHeight: 560});

    assert.equal(resizedImageSrc, 'https://cdn.shopify.com/s/files/1/1019/0495/products/babyandco5_280x560.jpg');
  });

  test('it returns the correct url for filenames with .', () => {
    const resizedImageSrc = imageHelpers.imageForSize({src: 'https://cdn.shopify.com/s/files/1/1019/0495/products/Ashley.34.51031.test.jpg?v=1505141764'}, {maxWidth: 280, maxHeight: 560});

    assert.equal(resizedImageSrc, 'https://cdn.shopify.com/s/files/1/1019/0495/products/Ashley.34.51031.test_280x560.jpg?v=1505141764');
  });

  test('it returns the image src with the specified width, height and crop', () => {
    const resizedImageSrc = imageHelpers.imageForSize({src: 'https://cdn.shopify.com/s/files/1/1019/0495/products/babyandco5.jpg?v=1487171332'}, {maxWidth: 280, maxHeight: 560, crop: 'center'});

    assert.equal(resizedImageSrc, 'https://cdn.shopify.com/s/files/1/1019/0495/products/babyandco5_280x560_crop_center.jpg?v=1487171332');
  });

  test('it returns the image src with the specified width, height, crop and scale', () => {
    const resizedImageSrc = imageHelpers.imageForSize({src: 'https://cdn.shopify.com/s/files/1/1019/0495/products/babyandco5.jpg?v=1487171332'}, {maxWidth: 280, maxHeight: 560, crop: 'center', scale: 2});

    assert.equal(resizedImageSrc, 'https://cdn.shopify.com/s/files/1/1019/0495/products/babyandco5_280x560_crop_center@2x.jpg?v=1487171332');
  });

  test('it returns the image src with the specified width, height, crop, scale and format', () => {
    const resizedImageSrc = imageHelpers.imageForSize({src: 'https://cdn.shopify.com/s/files/1/1019/0495/products/babyandco5.jpg?v=1487171332'}, {maxWidth: 280, maxHeight: 560, crop: 'center', scale: 2, format: 'progressive'});

    assert.equal(resizedImageSrc, 'https://cdn.shopify.com/s/files/1/1019/0495/products/babyandco5_280x560_crop_center@2x.progressive.jpg?v=1487171332');
  });

  test('it returns the image src with jpg format', () => {
    const resizedImageSrc = imageHelpers.imageForSize({src: 'https://cdn.shopify.com/s/files/1/2446/9977/files/tracksmith-logo.png?11120365955370323516'}, {format: 'jpg'});

    assert.equal(resizedImageSrc, 'https://cdn.shopify.com/s/files/1/2446/9977/files/tracksmith-logo.png.jpg?11120365955370323516');
  });

  test('it returns the image src with jpg format', () => {
    const resizedImageSrc = imageHelpers.imageForSize({src: 'https://cdn.shopify.com/s/files/1/2446/9977/files/tracksmith-logo.png?11120365955370323516'}, {format: 'progressive'});

    assert.equal(resizedImageSrc, 'https://cdn.shopify.com/s/files/1/2446/9977/files/tracksmith-logo.progressive.png.jpg?11120365955370323516');
  });

  test('it returns the correct url for an image src with . in the query param', () => {
    const resizedImageSrc = imageHelpers.imageForSize({src: 'https://cdn.shopify.com/s/files/1/1019/0495/products/babyandco5.jpg?v=148.71713.32'}, {maxWidth: 280, maxHeight: 560});

    assert.equal(resizedImageSrc, 'https://cdn.shopify.com/s/files/1/1019/0495/products/babyandco5_280x560.jpg?v=148.71713.32');
  });
});
