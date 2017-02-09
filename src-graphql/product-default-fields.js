import optionQuery from './option-query';
import imageConnectionQuery from './image-connection-query';
import variantConnectionQuery from './variant-connection-query';

export default ['id', 'createdAt', 'updatedAt', 'bodyHtml', 'handle', 'productType', 'title', 'vendor', 'tags',
  'publishedAt', ['options', optionQuery()], ['images', imageConnectionQuery()], ['variants', variantConnectionQuery()]];
