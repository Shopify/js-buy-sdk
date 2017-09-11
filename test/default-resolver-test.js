import assert from 'assert';
import defaultResolver from '../src/default-resolver';

suite('default-resolver-test', () => {
  test('it resolves a given key', () => {
    const value = 'a value';
    const object = {aKey: value};
    const resolve = defaultResolver('aKey');

    assert.equal(resolve({model: object}), value);
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

    assert.equal(resolve({model: object}), value);
  });
});
