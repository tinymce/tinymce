import { Gene } from '@ephox/boss';
import { TestUniverse } from '@ephox/boss';
import { Arr } from '@ephox/katamari';
import Simplify from 'ephox/robin/pathway/Simplify';
import { UnitTest, assert } from '@ephox/bedrock';

UnitTest.test('SimplifyTest', function() {
  var doc = TestUniverse(Gene('root', 'root', [
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

  var check = function (expected, raw) {
    var path = Arr.map(raw, function (r) {
      return doc.find(doc.get(), r).getOrDie('Could not find: ' + r);
    });

    var actual = Simplify.simplify(doc, path);
    assert.eq(expected, Arr.map(actual, function (s) { return s.id; }));
  };

  check([], []);
  check([ 'a' ], [ 'a' ]);
  check([ 'a' ], [ 'a', 'aa', 'ab' ]);
  check([ 'a' ], [ 'a', 'aa', 'ab', 'acbba' ]);
  check([ 'a', 'b' ], [ 'a', 'aa', 'ab', 'b' ]);
});

