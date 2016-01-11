let counter;

export function resetStep() {
  counter = 1;
}

export function step(expectedValue, description, assert) {
  assert.equal(counter, expectedValue, `Step ${expectedValue}: description`);
  counter++;
}
