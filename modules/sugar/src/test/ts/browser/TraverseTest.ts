import { Assert, UnitTest } from '@ephox/bedrock-client';
import { document, Element as DomElement, Node as DomNode, window } from '@ephox/dom-globals';
import { Arr } from '@ephox/katamari';
import { KAssert } from '@ephox/katamari-assertions';
import * as InsertAll from 'ephox/sugar/api/dom/InsertAll';
import Element from 'ephox/sugar/api/node/Element';
import * as Node from 'ephox/sugar/api/node/Node';
import * as Attr from 'ephox/sugar/api/properties/Attr';
import * as Traverse from 'ephox/sugar/api/search/Traverse';

UnitTest.test('TraverseTest', () => {
  const node = (name: string) => {
    const div = Element.fromTag('div');
    Attr.set(div, 'name', name);
    return div;
  };

  const textNode = (text: string) => Element.fromText(text);

  const grandparent = node('grandparent');
  const uncle = node('uncle');
  const mother = node('mother');

  const youngest = node('youngest');
  const middle = node('middle');
  const oldest = node('oldest');

  InsertAll.append(grandparent, [ uncle, mother ]);
  InsertAll.append(mother, [ youngest, middle, oldest ]);

  const checkNone = (subject: Element<DomElement>) => {
    KAssert.eqNone(() => 'Expected "' + Attr.get(subject, 'name') + '" not to have a parent.', Traverse.findIndex(subject));
  };

  const checkIndex = (expected: number, subject: Element<DomElement>) => {
    const actual = Traverse.findIndex(subject);
    KAssert.eqSome('eq', expected, actual);
  };

  Arr.each([ grandparent ], checkNone);
  checkIndex(0, uncle);
  checkIndex(1, mother);
  checkIndex(0, youngest);
  checkIndex(1, middle);
  checkIndex(2, oldest);

  const checkSiblings = (expected: Element<DomElement>[], subject: Element<DomElement>, direction: (element: Element<DomElement>) => Element<DomNode>[]) => {
    const actual = direction(subject);

    const getName = (e: Element<DomNode>) => Node.isElement(e) ? Attr.get(e, 'name') : '';

    Assert.eq('eq',
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

  checkSiblings([ c1, c2 ], c3, Traverse.prevSiblings);
  checkSiblings([ c4, c5, c6 ], c3, Traverse.nextSiblings);

  checkSiblings([ c1 ], c2, Traverse.prevSiblings);
  checkSiblings([ c6 ], c5, Traverse.nextSiblings);

  const el = Element.fromTag('div');
  Assert.eq('eq', true, Traverse.owner(el).dom() === document);
  Assert.eq('eq', true, Traverse.defaultView(el).dom() === window);

  const n = node('n');
  c1 = node('c1');
  c2 = node('c2');
  const t1 = textNode('t1');
  const t2 = textNode('t2');
  const t3 = textNode('t3');
  InsertAll.append(n, [ c1, t1, c2, t2, t3 ]);
  Assert.eq('eq', 0, Traverse.childNodesCount(c1));
  Assert.eq('eq', 0, Traverse.childNodesCount(t1));
  Assert.eq('eq', 5, Traverse.childNodesCount(n));
  Assert.eq('eq', false, Traverse.hasChildNodes(t1));
  Assert.eq('eq', true, Traverse.hasChildNodes(n));
});
