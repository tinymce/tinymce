import { Arr } from '@ephox/katamari';
import * as Attr from 'ephox/sugar/api/properties/Attr';
import Element from 'ephox/sugar/api/node/Element';
import * as InsertAll from 'ephox/sugar/api/dom/InsertAll';
import * as Traverse from 'ephox/sugar/api/search/Traverse';
import { UnitTest, assert } from '@ephox/bedrock';
import { document, window } from '@ephox/dom-globals';

UnitTest.test('TraverseTest', function () {
  const node = function (name) {
    const div = Element.fromTag('div');
    Attr.set(div, 'name', name);
    return div;
  };

  const textNode = function (text) {
    const elm = Element.fromText(text);
    return elm;
  };

  const grandparent = node('grandparent');
  const uncle = node('uncle');
  const mother = node('mother');

  const youngest = node('youngest');
  const middle = node('middle');
  const oldest = node('oldest');

  InsertAll.append(grandparent, [ uncle, mother ]);
  InsertAll.append(mother, [ youngest, middle, oldest ]);

  const checkNone = function (subject) {
    assert.eq(true, Traverse.findIndex(subject).isNone(), 'Expected "' + Attr.get(subject, 'name') + '" not to have a parent.');
  };

  const checkIndex = function (expected, subject) {
    const name = Attr.get(subject, 'name');
    const actual = Traverse.findIndex(subject);
    assert.eq(true, actual.isSome(), 'Expected "' + name + '" to have a parent.');
    assert.eq(expected, actual.getOrDie(), 'Expected index of "' + name + '" was: ' + expected + '. Was ' + actual.getOrDie());
  };

  Arr.each([ grandparent ], checkNone);
  checkIndex(0, uncle);
  checkIndex(1, mother);
  checkIndex(0, youngest);
  checkIndex(1, middle);
  checkIndex(2, oldest);

  const checkSiblings = function (expected, subject, direction) {
    const actual = direction(subject);

    const getName = function (e) { return Attr.get(e, 'name'); };

    assert.eq(
      Arr.map(expected, getName),
      Arr.map(actual, getName)
    );
  };

  const aunt = node('aunt');
  let c1 = node('c1');
  let c2 = node('c2');
  const c3 = node('c3');
  const c4 = node('c4');
  const c5 = node('c5');
  const c6 = node('c6');
  InsertAll.append(aunt, [ c1, c2, c3, c4, c5, c6 ]);

  checkSiblings([ c1, c2 ],     c3, Traverse.prevSiblings);
  checkSiblings([ c4, c5, c6 ], c3, Traverse.nextSiblings);

  checkSiblings([ c1 ],         c2, Traverse.prevSiblings);
  checkSiblings([ c6 ],         c5, Traverse.nextSiblings);

  const el = Element.fromTag('div');
  assert.eq(true, Traverse.owner(el).dom() === document);
  assert.eq(true, Traverse.defaultView(el).dom() === window);

  const n = node('n');
  c1 = node('c1');
  c2 = node('c2');
  const t1 = textNode('t1');
  const t2 = textNode('t2');
  const t3 = textNode('t3');
  InsertAll.append(n, [ c1, t1, c2, t2, t3 ]);
  assert.eq(0, Traverse.childNodesCount(c1));
  assert.eq(0, Traverse.childNodesCount(t1));
  assert.eq(5, Traverse.childNodesCount(n));
  assert.eq(false, Traverse.hasChildNodes(t1));
  assert.eq(true, Traverse.hasChildNodes(n));
});
