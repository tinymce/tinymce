import { assert, UnitTest } from '@ephox/bedrock-client';
import { Gene, TestUniverse } from '@ephox/boss';
import Structure from 'ephox/robin/api/general/Structure';

UnitTest.test('StructureTest', function () {
  const doc = TestUniverse(Gene('root', 'root', [
    Gene('d1', 'div', []),
    Gene('ol1', 'ol', []),
    Gene('li1', 'li', []),
    Gene('br1', 'br', []),
    Gene('img1', 'img', []),
    Gene('hr1', 'hr', []),
    Gene('a1', 'a', []),
    Gene('span1', 'span', []),
    Gene('strong1', 'strong', [])
  ]));

  const check = function (expected: boolean, id: string) {
    const item = doc.find(doc.get(), id).getOrDie();
    const actual = Structure.isInline(doc, item);
    assert.eq(expected, actual);
  };

  check(false, 'd1');
  check(false, 'ol1');
  check(false, 'li1');
  check(false, 'br1');
  check(false, 'img1');
  check(false, 'hr1');
  check(true, 'a1');
  check(true, 'span1');
  check(true, 'strong1');
});
