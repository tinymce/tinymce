import { Assert, UnitTest } from '@ephox/bedrock-client';
import { Arr } from '@ephox/katamari';

import * as NodeTypes from 'ephox/sugar/api/node/NodeTypes';
import { SugarElement } from 'ephox/sugar/api/node/SugarElement';
import * as SugarNode from 'ephox/sugar/api/node/SugarNode';
import * as Traverse from 'ephox/sugar/api/search/Traverse';
import EphoxElement from 'ephox/sugar/test/EphoxElement';

UnitTest.test('NodeTest', () => {
  const check = (node: SugarElement<Node>, nodeType: number, nodeName: string, nodeValue: string | null, isElement: boolean, isText: boolean, isDocument: boolean) => {
    Assert.eq('', nodeType, SugarNode.type(node));
    Assert.eq('', nodeName, SugarNode.name(node));
    Assert.eq('', nodeValue, SugarNode.value(node));
    Assert.eq('', isElement, SugarNode.isElement(node));
    Assert.eq('', isText, SugarNode.isText(node));
    Assert.eq('', isDocument, SugarNode.isDocument(node));
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
    SugarElement.fromDom(document.createTextNode('gobble')),
    NodeTypes.TEXT,
    '#text',
    'gobble',
    false,
    true,
    false
  );

  check(
    SugarElement.fromDom(document),
    NodeTypes.DOCUMENT,
    '#document',
    null,
    false,
    false,
    true
  );

  const checkIs = (expected: boolean[], predicate: (element: SugarElement<Node>) => boolean, inputs: string[]) => {
    const actual = Arr.map(inputs, (raw) => {
      const element = SugarElement.fromHtml(raw);
      const input = Traverse.firstChild(element).getOrDie();
      return predicate(input);
    });

    Assert.eq('', expected, actual);
  };

  const data = [ '<div>Hello</div>', '<div><span>Hello</span></div>', '<div><!-- I am a comment --></div>' ];

  checkIs([ true, false, false ], SugarNode.isText, data);
  checkIs([ false, false, true ], SugarNode.isComment, data);
  checkIs([ false, true, false ], SugarNode.isElement, data);
});
