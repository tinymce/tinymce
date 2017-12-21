import { Gene } from '@ephox/boss';
import { TestUniverse } from '@ephox/boss';
import { Arr } from '@ephox/katamari';
import Simplify from 'ephox/robin/pathway/Simplify';
import { UnitTest, assert } from '@ephox/bedrock';

UnitTest.test('SimplifyTest', function() {
  var doc = TestUniverse(Gene('root', 'root', [
    { id: 'a', children: [
      { id: 'aa', children: [
        { id: 'aaa', children: [] },
        { id: 'aab', children: [] },
        { id: 'aac', children: [] }
      ]},
      { id: 'ab', children: [] },
      { id: 'ac', children: [
        { id: 'aca', children: [] },
        { id: 'acb', children: [
          { id: 'acba', children: [] },
          { id: 'acbb', children: [
            { id: 'acbba', children: [] }
          ]}
        ]}
      ]}
    ]},
    { id: 'b', children: [] },
    { id: 'c', children: [
      { id: 'ca', children: [] },
      { id: 'cb', children: [
        { id: 'cba', children: [
          { id: 'cbaa', children: [] },
          { id: 'cbab', children: [] }
        ]},
        { id: 'cbb', children: [] }
      ]}
    ]}
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

