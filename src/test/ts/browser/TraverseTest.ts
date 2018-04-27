import { Arr } from '@ephox/katamari';
import Attr from 'ephox/sugar/api/properties/Attr';
import Element from 'ephox/sugar/api/node/Element';
import InsertAll from 'ephox/sugar/api/dom/InsertAll';
import Traverse from 'ephox/sugar/api/search/Traverse';
import { UnitTest, assert } from '@ephox/bedrock';
import { document, window } from '@ephox/dom-globals';

UnitTest.test('TraverseTest', function() {
  var node = function (name) {
    var div = Element.fromTag('div');
    Attr.set(div, 'name', name);
    return div;
  };

  var textNode = function (text) {
    var el = Element.fromText(text);
    return el;
  };

  var grandparent = node('grandparent');
  var uncle = node('uncle');
  var mother = node('mother');

  var youngest = node('youngest');
  var middle = node('middle');
  var oldest = node('oldest');

  InsertAll.append(grandparent, [ uncle, mother ]);
  InsertAll.append(mother, [ youngest, middle, oldest ]);

  var checkNone = function (subject) {
    assert.eq(true, Traverse.findIndex(subject).isNone(), 'Expected "' + Attr.get(subject, 'name') + '" not to have a parent.');
  };

  var checkIndex = function (expected, subject) {
    var name = Attr.get(subject, 'name');
    var actual = Traverse.findIndex(subject);
    assert.eq(true, actual.isSome(), 'Expected "' + name + '" to have a parent.');
    assert.eq(expected, actual.getOrDie(), 'Expected index of "' + name + '" was: ' + expected + '. Was ' + actual.getOrDie());
  };

  Arr.each([ grandparent ], checkNone);
  checkIndex(0, uncle);
  checkIndex(1, mother);
  checkIndex(0, youngest);
  checkIndex(1, middle);
  checkIndex(2, oldest);

  var checkSiblings = function (expected, subject, direction) {
    var actual = direction(subject);

    var getName = function (e) { return Attr.get(e, 'name'); };

    assert.eq(
      Arr.map(expected, getName),
      Arr.map(actual, getName)
    );
  };

  var aunt = node('aunt');
  var c1 = node('c1');
  var c2 = node('c2');
  var c3 = node('c3');
  var c4 = node('c4');
  var c5 = node('c5');
  var c6 = node('c6');
  InsertAll.append(aunt, [ c1, c2, c3, c4, c5, c6 ]);

  checkSiblings([ c1, c2 ],     c3, Traverse.prevSiblings);
  checkSiblings([ c4, c5, c6 ], c3, Traverse.nextSiblings);

  checkSiblings([ c1 ],         c2, Traverse.prevSiblings);
  checkSiblings([ c6 ],         c5, Traverse.nextSiblings);

  var el = Element.fromTag('div');
  assert.eq(true, Traverse.owner(el).dom() === document);
  assert.eq(true, Traverse.defaultView(el).dom() === window);

  var n = node('n');
  var c1 = node('c1');
  var c2 = node('c2');
  var t1 = textNode('t1');
  var t2 = textNode('t2');
  var t3 = textNode('t3');
  InsertAll.append(n, [ c1, t1, c2, t2, t3 ]);
  assert.eq(0, Traverse.childNodesCount(c1));
  assert.eq(0, Traverse.childNodesCount(t1));
  assert.eq(5, Traverse.childNodesCount(n));
  assert.eq(false, Traverse.hasChildNodes(t1));
  assert.eq(true, Traverse.hasChildNodes(n));
});

