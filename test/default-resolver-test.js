import assert from 'assert';
import defaultResolver, {defaultErrors} from '../src/default-resolver';

suite('default-resolver-test', () => {
  test('it resolves a given key', () => {
    const value = 'a value';
    const object = {aKey: value};
    const resolve = defaultResolver('aKey');

    return resolve({model: object}).then((resolvedValue) => {
      assert.equal(resolvedValue, value);
    });
  });

  test('it resolves a given path', () => {
    const value = 'a value';
    const object = {
      refOne: {
        refTwo: {
          refThree: {
            refFour: value
          }
        }
      }
    };
    const resolve = defaultResolver('refOne.refTwo.refThree.refFour');

    return resolve({model: object}).then((resolvedValue) => {
      assert.equal(resolvedValue, value);
    });
  });

  test('it rejects with top level errors hash if available', () => {
    const errors = [
      {
        message: 'an error message'
      }
    ];
    const resolve = defaultResolver('node');

    return resolve({errors}).then(() => {
      assert.ok(false, 'should not resolve');
    }).catch((resolvedErrors) => {
      assert.equal(resolvedErrors, errors);

      return true;
    });
  });

  test('it rejects with synthetic errors hash if no top level key available', () => {
    const resolve = defaultResolver('node');

    return resolve({}).then(() => {
      assert.ok(false, 'should not resolve');
    }).catch((resolvedErrors) => {
      assert.equal(resolvedErrors, defaultErrors);

      return true;
    });
  });
});
