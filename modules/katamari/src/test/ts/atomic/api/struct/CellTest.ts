import { Cell } from 'ephox/katamari/api/Cell';
import { UnitTest, Assert } from '@ephox/bedrock-client';
import fc from 'fast-check';

UnitTest.test('Cell: unit test', () => {
  const single = Cell('hello world');
  Assert.eq('get 1', 'hello world', single.get());
  single.set('again');
  Assert.eq('get 2', 'again', single.get());
});

UnitTest.test('Cell: cell(x).get() === x', () => {
  fc.assert(fc.property(fc.integer(), (i) => {
    const cell = Cell(i);
    Assert.eq('eq', i, cell.get());
  }));
});

UnitTest.test('Cell: cell.get() === last set call', () => {
  fc.assert(fc.property(fc.integer(), fc.integer(), fc.integer(), (a, b, c) => {
    const cell = Cell(a);
    Assert.eq('a', a, cell.get());
    cell.set(b);
    Assert.eq('b', b, cell.get());
    cell.set(c);
    Assert.eq('c', c, cell.get());
  }));
});
