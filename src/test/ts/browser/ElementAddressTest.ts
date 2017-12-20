import { Arr } from '@ephox/katamari';
import Hierarchy from 'ephox/sugar/api/dom/Hierarchy';
import Insert from 'ephox/sugar/api/dom/Insert';
import Remove from 'ephox/sugar/api/dom/Remove';
import Body from 'ephox/sugar/api/node/Body';
import Element from 'ephox/sugar/api/node/Element';
import Node from 'ephox/sugar/api/node/Node';
import Attr from 'ephox/sugar/api/properties/Attr';
import Html from 'ephox/sugar/api/properties/Html';
import ElementAddress from 'ephox/sugar/api/search/ElementAddress';
import { UnitTest, assert } from '@ephox/bedrock';

UnitTest.test('ElementAddressTest', function() {
  var page = Element.fromHtml(
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


  Insert.append(Body.body(), page);

  var checkChild = function (expected, path) {
    var element = Hierarchy.follow(page, path).getOrDie('Could not find path: ' + path.join(','));
    var actual = ElementAddress.childOf(element, page).getOrDie('Expected to find in line to ancestor');
    assert.eq(expected, toStr(actual));
  };

  var toStr = function (element) {
    if (Attr.has(element, 'id')) return Node.name(element) + '#' + Attr.get(element, 'id');
    else if (Node.name(element) === 'td' || Node.name(element) === 'th') return Html.getOuter(element);
    else return Node.name(element);
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


  var checkInParentOfSelector = function (expected, startPath, selector) {
    var element = Hierarchy.follow(page, startPath).getOrDie('Could not find: ' + startPath);
    var actual = ElementAddress.selectorsInParent(element, selector).getOrDie('None for inParent');
    assert.eq(expected.parent, toStr(actual.parent()));
    assert.eq(expected.children, Arr.map(actual.children(), toStr));
    assert.eq(expected.element, toStr(actual.element()));
    assert.eq(expected.index, actual.index());
  };

  var checkInParentOfAny = function (expected, startPath) {
    var element = Hierarchy.follow(page, startPath).getOrDie('Could not find: ' + startPath);
    var actual = ElementAddress.indexInParent(element).getOrDie('None for inParent');
    assert.eq(expected.parent, toStr(actual.parent()));
    assert.eq(expected.children, Arr.map(actual.children(), toStr));
    assert.eq(expected.element, toStr(actual.element()));
    assert.eq(expected.index, actual.index());
  };

  var checkNoneInParentOfSelector = function (startPath, ancestorSelector, descendantSelector) {
    var element = Hierarchy.follow(page, startPath).getOrDie('Could not find: ' + startPath);
    var actual = ElementAddress.selectorsInParent(element, ancestorSelector, descendantSelector);
    if (actual.isSome()) assert.fail('Expected none for parent: Was: ' + actual.getOrDie().index());
    else assert.eq(true, actual.isNone());
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
    [ 1, 1, 1, 2], 'td'
  );

  checkNoneInParentOfSelector(
    [ 1, 1, 1, 2], 'th', 'th'
  );

  checkInParentOfAny(
    {
      parent: 'p#p1',
      children: [ '#text', 'span#s1', '#text', 'span#s2', '#text', 'span#s3', '#text' ],
      element: 'span#s2',
      index: 3
    },
    [0, 3]
  );


  var checkInAncestorOfSelector = function (expected, startPath, ancestorSelector, descendantSelector) {
    var element = Hierarchy.follow(page, startPath).getOrDie('Could not find: ' + startPath);
    var actual = ElementAddress.descendantsInAncestor(element, ancestorSelector, descendantSelector).getOrDie('None for inAncestor');
    assert.eq(expected.ancestor, toStr(actual.ancestor()));
    assert.eq(expected.descendants, Arr.map(actual.descendants(), toStr));
    assert.eq(expected.element, toStr(actual.element()));
    assert.eq(expected.index, actual.index());
  };

  var checkNoneInAncestorOfSelector = function (startPath, ancestorSelector, descendantSelector) {
    var element = Hierarchy.follow(page, startPath).getOrDie('Could not find: ' + startPath);
    var actual = ElementAddress.descendantsInAncestor(element, ancestorSelector, descendantSelector);
    if (actual.isSome()) assert.fail('Expected none for ancestor: Was: ' + actual.getOrDie().index());
    else assert.eq(true, actual.isNone());
  };

  checkInAncestorOfSelector(
    {
      ancestor: 'table',
      descendants: [ '<th>Name</th>','<th>Occupation</th>','<th>Entitlement</th>','<th>A</th>','<th>B</th>','<th>C</th>' ],
      element: '<th>B</th>',
      index: 4
    },
    [ 1, 1, 0, 1 ], 'table', 'th'
  );

  checkInAncestorOfSelector(
    {
      ancestor: 'tbody',
      descendants: [ '<th>A</th>','<th>B</th>','<th>C</th>' ],
      element: '<th>B</th>',
      index: 1
    },
    [ 1, 1, 0, 1 ], 'tbody', 'th'
  );

  checkInAncestorOfSelector(
    {
      ancestor: 'thead',
      descendants: [ '<th>Name</th>','<th>Occupation</th>','<th>Entitlement</th>' ],
      element: '<th>Entitlement</th>',
      index: 2
    },
    [ 1, 0, 0, 2 ], 'thead', 'th'
  );

  checkNoneInAncestorOfSelector(
    [ 1, 1, 0, 2 ], 'thead', 'th'
  );

  (function () {
    var alpha = Element.fromTag('div');
    var beta = Element.fromTag('div');
    var gamma = Element.fromTag('div');
    assert.eq(true, ElementAddress.indexOf([], alpha).isNone(), 'Nothing in list.');
    assert.eq(0, ElementAddress.indexOf([ alpha ], alpha).getOrDie('alpha indexOf([alpha]) = 0'));
    assert.eq(true, ElementAddress.indexOf([ beta ], alpha).isNone(), 'Alpha not in list [beta]');
    assert.eq(1, ElementAddress.indexOf([ alpha, beta ], beta).getOrDie('beta indexOf([alpha,beta]) = 1'));
    assert.eq(2, ElementAddress.indexOf([ alpha, beta, gamma ], gamma).getOrDie('gamma indexOf([alpha,beta,gamma]) = 1'));
    assert.eq(1, ElementAddress.indexOf([ alpha, beta, gamma ], beta).getOrDie('beta indexOf([alpha,beta,gamma]) = 1'));

  })();

  Remove.remove(page);
});

