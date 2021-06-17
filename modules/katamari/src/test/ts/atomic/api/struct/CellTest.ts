import { describe, it } from '@ephox/bedrock-client';
import { assert } from 'chai';
import fc from 'fast-check';

import { Cell } from 'ephox/katamari/api/Cell';

describe('atomic.katamari.api.struct.CellTest', () => {
  it('unit test', () => {
    const single = Cell('hello world');
    assert.equal(single.get(), 'hello world');
    single.set('again');
    assert.equal(single.get(), 'again');
  });

  it('cell(x).get() === x', () => {
    fc.assert(fc.property(fc.integer(), (i) => {
      const cell = Cell(i);
      assert.equal(cell.get(), i);
    }));
  });

  it('cell.get() === last set call', () => {
    fc.assert(fc.property(fc.integer(), fc.integer(), fc.integer(), (a, b, c) => {
      const cell = Cell(a);
      assert.equal(cell.get(), a);
      cell.set(b);
      assert.equal(cell.get(), b);
      cell.set(c);
      assert.equal(cell.get(), c);
    }));
  });
});
