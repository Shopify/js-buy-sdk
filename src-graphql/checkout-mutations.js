import checkoutQuery from './checkout-query';

export default class CheckoutMutations {
  constructor(client) {
    this.graphQLClient = client;
  }

  create(input, query = checkoutQuery()) {
    const mutation = this.graphQLClient.mutation((root) => {
      root.add('checkoutCreate', {args: {input}}, (checkoutCreate) => {
        checkoutCreate.add('userErrors', (userErrors) => {
          userErrors.add('message');
        });
        query(checkoutCreate, 'checkout');
      });
    });

    return this.graphQLClient.send(mutation).then((result) => {
      return result.model.checkoutCreate.checkout;
    });
  }
}
