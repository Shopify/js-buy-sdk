import baseQuery from './base-query';

export default function attributeQuery(fields = ['key', 'value']) {
  return baseQuery(fields);
}
