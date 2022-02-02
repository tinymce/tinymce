import { Assert, UnitTest } from '@ephox/bedrock-client';
import { Arr } from '@ephox/katamari';
import { KAssert } from '@ephox/katamari-assertions';

import * as Hierarchy from 'ephox/sugar/api/dom/Hierarchy';
import * as Insert from 'ephox/sugar/api/dom/Insert';
import * as Remove from 'ephox/sugar/api/dom/Remove';
import * as SugarBody from 'ephox/sugar/api/node/SugarBody';
import { SugarElement } from 'ephox/sugar/api/node/SugarElement';
import * as SugarNode from 'ephox/sugar/api/node/SugarNode';
import * as Attribute from 'ephox/sugar/api/properties/Attribute';
import * as Html from 'ephox/sugar/api/properties/Html';
import * as ElementAddress from 'ephox/sugar/api/search/ElementAddress';

interface TestParentSpec {
  parent: string;
  children: string[];
  element: string;
  index: number;
}

interface TestAncestorSpec {
  ancestor: string;
  descendants: string[];
  element: string;
  index: number;
}

UnitTest.test('ElementAddressTest', () => {
  const page = SugarElement.fromHtml(
    '<div>' +
      '<p id="p1">This is a paragraph <span id="s1">word</span> and another <span id="s2">word</span> and another <span id="s3">word</span> and more</p>' +
      '<table>' +
        '<thead>' +
          '<tr>' +
            '<th>Name</th><th>Occupation</th><th>Entitlement</th>' +
          '</tr>' +
        '</thead>' +
        '<tbody>' +
          '<tr>' +
            '<th>A</th><th>B</th><th>C</th>' +
          '</tr>' +
          '<tr>' +
            '<td>A1</td><td>B1</td><td>C1</td>' +
          '</tr>' +
          '<tr>' +
            '<td>A2</td><td>B2</td><td>C2</td>' +
          '</tr>' +
          '<tr>' +
            '<td>A3</td><td>B3</td><td>C3</td>' +
          '</tr>' +
          '<tr>' +
            '<td>A4</td><td>B4</td><td>C4</td>' +
          '</tr>' +
          '<tr>' +
            '<td>A5</td><td>B5</td><td>C5</td>' +
          '</tr>' +
          '<tr>' +
            '<td>A6</td><td>B6</td><td>C6</td>' +
          '</tr>' +
        '</tbody>' +
      '</table>' +
      '<p id="p2">Another paragraph</p>' +
    '</div>'
  );

  Insert.append(SugarBody.body(), page);

  const checkChild = (expected: string, path: number[]) => {
    const element = Hierarchy.follow(page, path).getOrDie('Could not find path: ' + path.join(','));
    const actual = ElementAddress.childOf(element, page).getOrDie('Expected to find in line to ancestor');
    Assert.eq('eq', expected, toStr(actual));
  };

  const toStr = (element: SugarElement<Node>) => {
    if (SugarNode.isElement(element) && Attribute.has(element, 'id')) {
      return SugarNode.name(element) + '#' + Attribute.get(element, 'id');
    } else if (SugarNode.name(element) === 'td' || SugarNode.name(element) === 'th') {
      return Html.getOuter(element);
    } else {
      return SugarNode.name(element);
    }
  };

  // page > table > thead > tr > th
  checkChild('table', [ 1, 0, 0, 0 ]);
  // page > table
  checkChild('table', [ 1 ]);
  // page > p
  checkChild('p#p2', [ 2 ]);
  // page > p
  checkChild('p#p1', [ 0 ]);
  // page > p > span > word
  checkChild('p#p1', [ 0, 1, 0 ]);

  const checkInParentOfSelector = (expected: TestParentSpec, startPath: number[], selector: string) => {
    const element = Hierarchy.follow(page, startPath).getOrDie('Could not find: ' + startPath);
    const actual = ElementAddress.selectorsInParent(element, selector).getOrDie('None for inParent');
    Assert.eq('eq', expected.parent, toStr(actual.parent));
    Assert.eq('eq', expected.children, Arr.map(actual.children, toStr));
    Assert.eq('eq', expected.element, toStr(actual.element));
    Assert.eq('eq', expected.index, actual.index);
  };

  const checkInParentOfAny = (expected: TestParentSpec, startPath: number[]) => {
    const element = Hierarchy.follow(page, startPath).getOrDie('Could not find: ' + startPath);
    const actual = ElementAddress.indexInParent(element).getOrDie('None for inParent');
    Assert.eq('eq', expected.parent, toStr(actual.parent));
    Assert.eq('eq', expected.children, Arr.map(actual.children, toStr));
    Assert.eq('eq', expected.element, toStr(actual.element));
    Assert.eq('eq', expected.index, actual.index);
  };

  const checkNoneInParentOfSelector = (startPath: number[], ancestorSelector: string) => {
    const element = Hierarchy.follow(page, startPath).getOrDie('Could not find: ' + startPath);
    const actual = ElementAddress.selectorsInParent(element, ancestorSelector);
    KAssert.eqNone('should be none', actual);
  };

  checkInParentOfSelector(
    {
      parent: 'p#p1',
      children: [ 'span#s1', 'span#s2', 'span#s3' ],
      element: 'span#s1',
      index: 0
    },
    [ 0, 1 ], 'span'
  );

  checkInParentOfSelector(
    {
      parent: 'p#p1',
      children: [ 'span#s1', 'span#s2', 'span#s3' ],
      element: 'span#s2',
      index: 1
    },
    [ 0, 3 ], 'span'
  );

  checkInParentOfSelector(
    {
      parent: 'tr',
      children: [ '<td>A1</td>', '<td>B1</td>', '<td>C1</td>' ],
      element: '<td>C1</td>',
      index: 2
    },
    [ 1, 1, 1, 2 ], 'td'
  );

  checkNoneInParentOfSelector(
    [ 1, 1, 1, 2 ], 'th'
  );

  checkInParentOfAny(
    {
      parent: 'p#p1',
      children: [ '#text', 'span#s1', '#text', 'span#s2', '#text', 'span#s3', '#text' ],
      element: 'span#s2',
      index: 3
    },
    [ 0, 3 ]
  );

  const checkInAncestorOfSelector = (expected: TestAncestorSpec, startPath: number[], ancestorSelector: string, descendantSelector: string) => {
    const element = Hierarchy.follow(page, startPath).getOrDie('Could not find: ' + startPath);
    const actual = ElementAddress.descendantsInAncestor(element, ancestorSelector, descendantSelector).getOrDie('None for inAncestor');
    Assert.eq('eq', expected.ancestor, toStr(actual.ancestor));
    Assert.eq('eq', expected.descendants, Arr.map(actual.descendants, toStr));
    Assert.eq('eq', expected.element, toStr(actual.element));
    Assert.eq('eq', expected.index, actual.index);
  };

  const checkNoneInAncestorOfSelector = (startPath: number[], ancestorSelector: string, descendantSelector: string) => {
    const element = Hierarchy.follow(page, startPath).getOrDie('Could not find: ' + startPath);
    const actual = ElementAddress.descendantsInAncestor(element, ancestorSelector, descendantSelector);
    KAssert.eqNone('should be none', actual);
  };

  checkInAncestorOfSelector(
    {
      ancestor: 'table',
      descendants: [ '<th>Name</th>', '<th>Occupation</th>', '<th>Entitlement</th>', '<th>A</th>', '<th>B</th>', '<th>C</th>' ],
      element: '<th>B</th>',
      index: 4
    },
    [ 1, 1, 0, 1 ], 'table', 'th'
  );

  checkInAncestorOfSelector(
    {
      ancestor: 'tbody',
      descendants: [ '<th>A</th>', '<th>B</th>', '<th>C</th>' ],
      element: '<th>B</th>',
      index: 1
    },
    [ 1, 1, 0, 1 ], 'tbody', 'th'
  );

  checkInAncestorOfSelector(
    {
      ancestor: 'thead',
      descendants: [ '<th>Name</th>', '<th>Occupation</th>', '<th>Entitlement</th>' ],
      element: '<th>Entitlement</th>',
      index: 2
    },
    [ 1, 0, 0, 2 ], 'thead', 'th'
  );

  checkNoneInAncestorOfSelector(
    [ 1, 1, 0, 2 ], 'thead', 'th'
  );

  (() => {
    const alpha = SugarElement.fromTag('div');
    const beta = SugarElement.fromTag('div');
    const gamma = SugarElement.fromTag('div');
    KAssert.eqNone('Expected nothing in list.', ElementAddress.indexOf([], alpha));
    KAssert.eqSome('alpha indexOf([alpha]) = 0', 0, ElementAddress.indexOf([ alpha ], alpha));
    KAssert.eqNone('Alpha not in list [beta]', ElementAddress.indexOf([ beta ], alpha));
    KAssert.eqSome('beta indexOf([alpha,beta]) = 1', 1, ElementAddress.indexOf([ alpha, beta ], beta));
    KAssert.eqSome('gamma indexOf([alpha,beta,gamma]) = 1', 2, ElementAddress.indexOf([ alpha, beta, gamma ], gamma));
    KAssert.eqSome('beta indexOf([alpha,beta,gamma]) = 1', 1, ElementAddress.indexOf([ alpha, beta, gamma ], beta));

  })();

  Remove.remove(page);
});
