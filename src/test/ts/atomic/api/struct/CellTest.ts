import { Cell } from 'ephox/katamari/api/Cell';
import Jsc from '@ephox/wrap-jsverify';
import { UnitTest, assert } from '@ephox/bedrock';

UnitTest.test('Cell', function() {
  const single = Cell('hello world');
  assert.eq('hello world', single.get());
  single.set('again');
  assert.eq('again', single.get());

  Jsc.property('cell(x).get() === x', Jsc.json, function (json) {
    const cell = Cell(json);
    return Jsc.eq(json, cell.get());
  });

  Jsc.property('cell.get() === last set call', Jsc.json, Jsc.json, Jsc.json, function (a, b, c) {
    const cell = Cell(a);
    const first = cell.get();
    cell.set(b);
    const second = cell.get();
    cell.set(c);
    const third = cell.get();
    return Jsc.eq(a, first) && Jsc.eq(b, second) && Jsc.eq(c, third);
  });
});

