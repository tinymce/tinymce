import { Arr } from '@ephox/katamari';
import Element from 'ephox/sugar/api/node/Element';
import * as Node from 'ephox/sugar/api/node/Node';
import * as NodeTypes from 'ephox/sugar/api/node/NodeTypes';
import * as Traverse from 'ephox/sugar/api/search/Traverse';
import EphoxElement from 'ephox/sugar/test/EphoxElement';
import { UnitTest, assert } from '@ephox/bedrock';
import { document } from '@ephox/dom-globals';

UnitTest.test('NodeTest', function () {
  const check = function (node, nodeType, nodeName, nodeValue, isElement, isText, isDocument) {
    assert.eq(nodeType, Node.type(node));
    assert.eq(nodeName, Node.name(node));
    assert.eq(nodeValue, Node.value(node));
    assert.eq(isElement, Node.isElement(node));
    assert.eq(isText, Node.isText(node));
    assert.eq(isDocument, Node.isDocument(node));
  };

  check(
    EphoxElement('p'),
    NodeTypes.ELEMENT,
    'p',
    null,
    true,
    false,
    false
  );

  check(
    Element.fromDom(document.createTextNode('gobble')),
    NodeTypes.TEXT,
    '#text',
    'gobble',
    false,
    true,
    false
  );

  check(
    Element.fromDom(document),
    NodeTypes.DOCUMENT,
    '#document',
    null,
    false,
    false,
    true
  );

  const checkIs = function (expected, predicate, inputs) {
    const actual = Arr.map(inputs, function (raw) {
      const element = Element.fromHtml(raw);
      const input = Traverse.firstChild(element).getOrDie();
      return predicate(input);
    });

    assert.eq(expected, actual);
  };

  const data = [ '<div>Hello</div>', '<div><span>Hello</span></div>', '<div><!-- I am a comment --></div>' ];

  checkIs([ true, false, false ], Node.isText, data);
  checkIs([ false, false, true ], Node.isComment, data);
  checkIs([ false, true, false ], Node.isElement, data);
});
