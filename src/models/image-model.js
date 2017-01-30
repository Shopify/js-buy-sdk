import CoreObject from '../metal/core-object';

export const variants = [
  { name: 'pico', dimension: '16x16' },
  { name: 'icon', dimension: '32x32' },
  { name: 'thumb', dimension: '50x50' },
  { name: 'small', dimension: '100x100' },
  { name: 'compact', dimension: '160x160' },
  { name: 'medium', dimension: '240x240' },
  { name: 'large', dimension: '480x480' },
  { name: 'grande', dimension: '600x600' },
  { name: '1024x1024', dimension: '1024x1024' },
  { name: '2048x2048', dimension: '2048x2048' }
];

const ImageModel = CoreObject.extend({
  constructor(attrs) {
    Object.keys(attrs).forEach(key => {
      this[key] = attrs[key];
    });
  },

  /**
    * Image variants available for an image. An example value of `imageVariant`:
    * ```
    * [
    *   {
    *     "name": "pico",
    *     "dimensions": "16x16",
    *     "src": "https://cdn.shopify.com/s/files/1/1019/0495/products/alien_146ef7c1-26e9-4e96-96e6-9d37128d0005_pico.jpg?v=1469046423"
    *   },
    *   {
    *     "name": "compact",
    *     "dimensions": "160x160",
    *     "src": "https://cdn.shopify.com/s/files/1/1019/0495/products/alien_146ef7c1-26e9-4e96-96e6-9d37128d0005_compact.jpg?v=1469046423"
    *   }
    * ]
    * ```
    *
    * @attribute variants
    * @type {Array}
  */
  get variants() {
    const src = this.src;
    const extensionIndex = src.lastIndexOf('.');
    const pathAndBasename = src.slice(0, extensionIndex);
    const extension = src.slice(extensionIndex);

    variants.forEach(variant => {
      variant.src = `${pathAndBasename}_${variant.name}${extension}`;
    });

    return variants;
  }
});

export default ImageModel;
