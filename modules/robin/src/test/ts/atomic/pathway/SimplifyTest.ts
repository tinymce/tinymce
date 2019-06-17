import { assert, UnitTest } from '@ephox/bedrock';
import { Gene, TestUniverse } from '@ephox/boss';
import { Arr } from '@ephox/katamari';
import Simplify from 'ephox/robin/pathway/Simplify';

UnitTest.test('SimplifyTest', function () {
  const doc = TestUniverse(Gene('root', 'root', [
    Gene('a', '.', [
      Gene('aa', '.', [
        Gene('aaa', '.'),
        Gene('aab', '.'),
        Gene('aac', '.')
      ]),
      Gene('ab', '.'),
      Gene('ac', '.', [
        Gene('aca', '.'),
        Gene('acb', '.', [
          Gene('acba', '.'),
          Gene('acbb', '.', [
            Gene('acbba', '.')
          ])
        ])
      ])
    ]),
    Gene('b', '.'),
    Gene('c', '.', [
      Gene('ca', '.'),
      Gene('cb', '.', [
        Gene('cba', '.', [
          Gene('cbaa', '.'),
          Gene('cbab', '.')
        ]),
        Gene('cbb', '.')
      ])
    ])
  ]));

  const check = function (expected: string[], raw: string[]) {
    const path = Arr.map(raw, function (r) {
      return doc.find(doc.get(), r).getOrDie('Could not find: ' + r);
    });

    const actual = Simplify.simplify(doc, path);
    assert.eq(expected, Arr.map(actual, function (s) { return s.id; }));
  };

  check([], []);
  check(['a'], ['a']);
  check(['a'], ['a', 'aa', 'ab']);
  check(['a'], ['a', 'aa', 'ab', 'acbba']);
  check(['a', 'b'], ['a', 'aa', 'ab', 'b']);
});