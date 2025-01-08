import { assert } from 'chai';

import { addTwo } from '../../../main/ts/core/AddTwo';

// This is an example of an atomic test, that is a test of some functionality separated from the editor.
describe('atomic.AddTwoTest', () => {
  it('should add 2 to any valid number', () => {
    assert.equal(addTwo(1), 3, '1 + 2 = 3, hopefully');
  });
});
