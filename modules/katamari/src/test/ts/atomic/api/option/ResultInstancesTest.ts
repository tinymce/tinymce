import { Assert, UnitTest } from '@ephox/bedrock-client';
import fc from 'fast-check';
import { Result } from 'ephox/katamari/api/Result';
import { tResult } from 'ephox/katamari/api/ResultInstances';
import { Testable, Pprint } from '@ephox/dispute';

const { tNumber, tString } = Testable;

UnitTest.test('ResultInstances.eq: value(x) = value(x)', () => {
  fc.assert(fc.property(fc.integer(), (i) => {
    Assert.eq(
      'results should be equal',
      Result.value<number, string>(i),
      Result.value<number, string>(i),
      tResult(tNumber, tString)
    );
  }));
});

UnitTest.test('ResultInstances.eq: error(x) = error(x)', () => {
  fc.assert(fc.property(fc.integer(), (i) => {
    Assert.eq(
      'results should be equal',
      Result.error<string, number>(i),
      Result.error<string, number>(i),
      tResult(tString, tNumber)
    );
  }));
});

UnitTest.test('ResultInstances.eq: value(a) != error(e)', () => {
  fc.assert(fc.property(fc.integer(), fc.string(), (a, e) => {
    Assert.eq(
      'results should not be equal #1',
      false,
      tResult(tNumber, tString).eq(
        Result.value<number, string>(a),
        Result.error<number, string>(e)
      ));

    Assert.eq(
      'results should not be equal #2',
      false,
      tResult(tNumber, tString).eq(
        Result.error<number, string>(e),
        Result.value<number, string>(a)
      ));
  }));
});

UnitTest.test('ResultInstances.eq: (a = b) = (value(a) = value(b))', () => {
  fc.assert(fc.property(fc.integer(), fc.integer(), (a, b) => {
    Assert.eq(
      'eq',
      a === b,
      tResult(tNumber, tString).eq(
        Result.value<number, string>(a),
        Result.value<number, string>(b)
      ));
  }));
});

UnitTest.test('ResultInstances.eq: (a = b) = (error(a) = error(b))', () => {
  fc.assert(fc.property(fc.string(), fc.string(), (a, b) => {
    Assert.eq(
      'eq',
      a === b,
      tResult(tNumber, tString).eq(
        Result.error<number, string>(a),
        Result.error<number, string>(b)
      ));
  }));
});

UnitTest.test('ResultInstances.pprint', () => {
  fc.assert(fc.property(fc.integer(), (i) => {
    Assert.eq('pprint value',
`Result.value(
  ${i}
)`,
      Pprint.render(Result.value(i), tResult(tNumber, tString))
    );

    Assert.eq('pprint error',
`Result.error(
  ${i}
)`,
      Pprint.render(Result.error(i), tResult(tString, tNumber))
    );
  }));
});
