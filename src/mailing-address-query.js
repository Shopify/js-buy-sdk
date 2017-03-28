import baseQuery from './base-query';

const defaultFields = [
  'address1',
  'address2',
  'city',
  'company',
  'country',
  'firstName',
  'formatted',
  'lastName',
  'latitude',
  'longitude',
  'phone',
  'province',
  'zip',
  'name',
  'countryCode',
  'provinceCode',
  'id'
];

export default function mailingAddressQuery(fields = defaultFields) {
  return baseQuery(fields);
}
