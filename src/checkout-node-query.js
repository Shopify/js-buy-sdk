import createGid from './create-gid';
import shippingRateQuery from './shipping-rate-query';
import lineItemConnectionQuery from './line-item-connection-query';
import mailingAddressQuery from './mailing-address-query';
import customAttributeQuery from './custom-attribute-query';
import orderQuery from './order-query';
import addFields from './add-fields';

const defaultFields = [
  'id',
  'ready',
  ['lineItems', lineItemConnectionQuery()],
  ['shippingAddress', mailingAddressQuery()],
  ['shippingLine', shippingRateQuery()],
  'requiresShipping',
  ['customAttributes', customAttributeQuery()],
  'note',
  'paymentDue',
  'webUrl',
  ['order', orderQuery()],
  'orderStatusUrl',
  'taxExempt',
  'taxesIncluded',
  'currencyCode',
  'totalTax',
  'subtotalPrice',
  'totalPrice',
  'completedAt',
  'createdAt',
  'updatedAt'
];

export default function checkoutNodeQuery(fields = defaultFields) {
  return function(parentSelection, fieldName, id) {
    parentSelection.add(fieldName, {args: {id: createGid('Checkout', id)}}, (node) => {
      node.addInlineFragmentOn('Checkout', (product) => {
        addFields(product, fields);
      });
    });
  };
}
