import optionQuery from './option-query';
import imageConnectionQuery from './image-connection-query';
import variantConnectionQuery from './variant-connection-query';
import isString from './is-string';

export const defaultFields = ['id', 'createdAt', 'updatedAt', 'bodyHtml', 'handle', 'productType', 'title', 'vendor', 'tags',
  'publishedAt', ['options', optionQuery()], ['images', imageConnectionQuery()], ['variants', variantConnectionQuery()]];

export default function addProductFields(product, productFields) {
  productFields.forEach((field) => {
    if (isString(field)) {
      product.add(field);
    } else {
      const [fieldName, builder] = field;

      builder(product, fieldName);
    }
  });
}
