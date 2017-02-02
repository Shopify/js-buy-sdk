import optionQuery from './option-query';
import imagesQuery from './images-query';
import variantQuery from './variant-query';
import createGid from './create-gid';

export default function productQuery({client, id}, fields = ['id', 'createdAt', 'updatedAt', 'bodyHtml', 'handle', 'productType',
  'title', 'vendor', 'tags', 'publishedAt', ['options', optionQuery()], ['images', imagesQuery()], ['variants', variantQuery()]]) {
  let query;

  if (id) {
    query = client.query((root) => {
      root.add('product', {args: {id: createGid('Product', id)}}, (product) => {
        addProductFields(product, fields);
      });
    });
  } else {
    query = client.query((root) => {
      root.add('shop', (shop) => {
        shop.addConnection('products', {first: 20}, (products) => {
          addProductFields(products, fields);
        });
      });
    });
  }

  return query;
}

function addProductFields(product, productFields) {
  productFields.forEach((field) => {
    if (Object.prototype.toString.call(field) === '[object String]') {
      product.add(field);
    } else {
      const [fieldName, builder] = field;

      builder(product, fieldName);
    }
  });
}
