import assert from "assert";
import checkoutUserErrorsMapper from "../src/checkout-map-user-error-codes";

suite("checkout-map-user-error-codes-test", () => {
  test("it returns an empty array if there are no user errors or warnings", () => {
    assert.deepStrictEqual(checkoutUserErrorsMapper([], []), []);
  });
  test("it maps a cart user error code to a checkout user error code, preserving the error message and field", () => {
    const userErrors = [
      {
        code: "ADDRESS_FIELD_IS_TOO_LONG",
        field: "address",
        message: "The provided address is too long.",
      },
    ];
    const warnings = [];
    assert.deepStrictEqual(
      checkoutUserErrorsMapper(userErrors, warnings),
      [{ code: "TOO_LONG", field: "address", message: "The provided address is too long." }]
    );
  });

  test("it maps a cart warning code to a checkout user error code, preserving the warning message", () => {
    const userErrors = [];
    const warnings = [
      {
          code: "MERCHANDISE_NOT_ENOUGH_STOCK",
          message: "The product is out of stock.",
      },
    ];
    assert.deepStrictEqual(
      checkoutUserErrorsMapper(userErrors, warnings),
      [{ code: "NOT_ENOUGH_IN_STOCK", message: "The product is out of stock." }]
    );
  });

  test("it maps cart user error and warning codes to checkout user error codes, if both cart user errors and cart warnings are present", () => {
    const userErrors = [{ code: "ADDRESS_FIELD_IS_TOO_LONG", field: "address", message: "The provided address is too long." }];
    const warnings = [{ code: "MERCHANDISE_NOT_ENOUGH_STOCK", message: "The product is out of stock." }];
    assert.deepStrictEqual(checkoutUserErrorsMapper(userErrors, warnings), [{ code: "TOO_LONG", field: "address", message: "The provided address is too long." }, { code: "NOT_ENOUGH_IN_STOCK", message: "The product is out of stock." }]);
  });
});
