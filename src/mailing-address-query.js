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

/**
 * Returns a callback function to build a mailing address query with specified fields.
 *
 * @example
 * const query = mailingAddressQuery(['city', 'province', 'country']);
 *
 * @memberof Client.Queries
 * @alias mailingAddressQuery
 * @param {Array} [fields] A list of fields to query on the mailing address. Default values are:
 *   <ul>
 *     <li>`'address1'`</li>
 *     <li>`'address2'`</li>
 *     <li>`'city'`</li>
 *     <li>`'company'`</li>
 *     <li>`'country'`</li>
 *     <li>`'firstName'`</li>
 *     <li>`'formatted'`</li>
 *     <li>`'lastName'`</li>
 *     <li>`'latitude'`</li>
 *     <li>`'longitude'`</li>
 *     <li>`'phone'`</li>
 *     <li>`'province'`</li>
 *     <li>`'zip'`</li>
 *     <li>`'name'`</li>
 *     <li>`'countryCode'`</li>
 *     <li>`'provinceCode'`</li>
 *     <li>`'id'`</li>
 *   </ul>
 * See the {@link https://help.shopify.com/api/storefront-api/reference/object/mailingaddress|Storefront API reference} for all possible values.
 */
export default function mailingAddressQuery(fields = defaultFields) {
  return baseQuery(fields);
}
