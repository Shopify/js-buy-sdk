import selectedOptionQuery from './selected-option-query';
import imageQuery from './image-query';
import baseQuery from './base-query';

const defaultFields = ['id', 'title', 'price', 'weight', ['image', imageQuery()], ['selectedOptions', selectedOptionQuery()]];

export default function productQuery(fields = defaultFields) {
  return baseQuery(fields);
}
