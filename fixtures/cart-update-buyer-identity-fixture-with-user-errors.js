export default {
  data: {
    cartBuyerIdentityUpdate: {
      cart: null,
      userErrors: [
        {
          field: [
            'buyerIdentity',
            'email'
          ],
          message: 'Email is invalid',
          code: 'INVALID'
        }
      ]
    }
  }
}
