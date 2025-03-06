export default {
  data: {
    cartLinesUpdate: {
      cart: null,
      userErrors: [
        {
          field: [
            'lines',
            '0',
            'merchandiseId'
          ],
          message: 'The merchandise with id gid://shopify/ProductVariant/invalid-id does not exist.',
          code: 'INVALID'
        }
      ]
    }
  }
}
