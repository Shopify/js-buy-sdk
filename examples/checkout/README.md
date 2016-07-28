### Checkout Example

When working with the SDK and a redirect is made to the `checkout_url`, a redirection is not made back to the caller after successful checkout. As a result, the caller is not aware of the success and ends up not clearing the cart.

This example illustrates how we recommend that you implement your checkout process. The caller listens to and acts on messages received via browser window `postMessages` fired by the checkout system.
