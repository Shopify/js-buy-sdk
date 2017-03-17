import baseQuery from './base-query';

export default function selectedOptionQuery(fields = ['name', 'value']) {
  return baseQuery(fields);
}
