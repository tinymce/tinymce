import { Option } from '@ephox/katamari';
import * as Class from 'ephox/sugar/api/properties/Class';
import Element from 'ephox/sugar/api/node/Element';
import * as Remove from 'ephox/sugar/api/dom/Remove';
import * as SelectorExists from 'ephox/sugar/api/search/SelectorExists';
import * as SelectorFilter from 'ephox/sugar/api/search/SelectorFilter';
import * as SelectorFind from 'ephox/sugar/api/search/SelectorFind';
import * as Selectors from 'ephox/sugar/api/search/Selectors';
import Checkers from 'ephox/sugar/test/Checkers';
import Div from 'ephox/sugar/test/Div';
import TestPage from 'ephox/sugar/test/TestPage';
import { UnitTest, assert } from '@ephox/bedrock-client';

UnitTest.test('SelectorTest', function () {
  // Querying non-element nodes does not throw an error

  const textnode = Element.fromText('');
  const commentnode = Element.fromHtml('<!--a-->');
  assert.eq(false, Selectors.is(textnode, 'anything'));
  assert.eq(false, Selectors.is(commentnode, 'anything'));
  assert.eq([], Selectors.all('anything', textnode));
  assert.eq([], Selectors.all('anything', commentnode));
  Checkers.checkOpt(Option.none(), Selectors.one('anything', textnode));
  Checkers.checkOpt(Option.none(), Selectors.one('anything', commentnode));
  assert.eq([], SelectorFilter.ancestors(textnode, 'anything'));
  assert.eq([], SelectorFilter.siblings(textnode, 'anything'));
  assert.eq([], SelectorFilter.children(textnode, 'anything'));

  try {
    // IE throws an error running complex queries on an empty div
    // http://jsfiddle.net/spyder/fv9ptr5L/
    const empty = Div();
    Selectors.all('img:not([data-ephox-polish-blob])', empty);
  } catch (e) {
    assert.fail(e);
  }

  TestPage.connect(); // description of structure is in TestPage

  Checkers.checkOpt(Option.none(), Selectors.one('asdf'));

  Checkers.checkOpt(Option.some(TestPage.p1), SelectorFind.first('p'));
  Checkers.checkOpt(Option.some(TestPage.p1), Selectors.one('p'));
  Checkers.checkOpt(Option.none(), SelectorFind.sibling(TestPage.s1, 'p'));
  Checkers.checkOpt(Option.some(TestPage.s3), SelectorFind.sibling(TestPage.s4, 'span'));
  Checkers.checkOpt(Option.none(), SelectorFind.ancestor(TestPage.s1, 'li'));
  Checkers.checkOpt(Option.some(TestPage.container), SelectorFind.ancestor(TestPage.s4, 'div'));
  Checkers.checkOpt(Option.some(TestPage.s2), SelectorFind.descendant(TestPage.p2, 'span'));
  Checkers.checkOpt(Option.some(TestPage.s3), SelectorFind.descendant(TestPage.p2, 'span span'));
  Checkers.checkOpt(Option.none(), SelectorFind.child(TestPage.p2, 'li'));
  Checkers.checkOpt(Option.some(TestPage.s1), SelectorFind.child(TestPage.p1, 'span'));
  Checkers.checkOpt(Option.none(), SelectorFind.closest(TestPage.p1, 'span'));
  Checkers.checkOpt(Option.some(TestPage.p1), SelectorFind.closest(TestPage.p1, 'p'));
  Checkers.checkOpt(Option.some(TestPage.p1), SelectorFind.closest(TestPage.s1, 'p'));
  Checkers.checkOpt(Option.some(TestPage.p1), SelectorFind.closest(TestPage.t1, 'p'));

  Checkers.checkList([TestPage.p1, TestPage.p3, TestPage.p2], SelectorFilter.all('p'));
  Checkers.checkList([TestPage.p1, TestPage.p3, TestPage.p2], Selectors.all('p'));
  Checkers.checkList([TestPage.s3, TestPage.s2], SelectorFilter.ancestors(TestPage.t4, 'span'));
  Checkers.checkList([TestPage.d1, TestPage.container], SelectorFilter.ancestors(TestPage.p3, 'div'));
  Checkers.checkList([], SelectorFilter.ancestors(TestPage.t4, 'table'));
  Checkers.checkList([TestPage.s1], SelectorFilter.siblings(TestPage.t1, '*'));
  Checkers.checkList([], SelectorFilter.siblings(TestPage.t5, '*'));
  Checkers.checkList([TestPage.s1], SelectorFilter.children(TestPage.p1, 'span'));
  Checkers.checkList([], SelectorFilter.children(TestPage.p1, 'li'));
  Checkers.checkList([TestPage.s1, TestPage.s2, TestPage.s3, TestPage.s4], SelectorFilter.descendants(TestPage.container, 'span'));
  Checkers.checkList([], SelectorFilter.descendants(TestPage.container, 'blockquote'));

  assert.eq(true, SelectorExists.any('p'));
  assert.eq(false, SelectorExists.any('table'));
  assert.eq(true, SelectorExists.ancestor(TestPage.t1, 'p'));
  assert.eq(false, SelectorExists.ancestor(TestPage.t1, 'span'));
  assert.eq(true, SelectorExists.sibling(TestPage.p2, 'p'));
  assert.eq(false, SelectorExists.sibling(TestPage.t1, 'p'));
  assert.eq(true, SelectorExists.child(TestPage.p1, 'span'));
  assert.eq(false, SelectorExists.child(TestPage.p2, 'label'));
  assert.eq(true, SelectorExists.descendant(TestPage.p2, 'span'));
  assert.eq(false, SelectorExists.closest(TestPage.p1, 'span'));
  assert.eq(true, SelectorExists.closest(TestPage.p1, 'p'));
  assert.eq(true, SelectorExists.closest(TestPage.s1, 'p'));
  assert.eq(true, SelectorExists.closest(TestPage.t1, 'p'));

  // simple selectors
  assert.eq(false, Selectors.is(TestPage.t1, 'p'), 'Text node should not match "p"');
  assert.eq(true, Selectors.is(TestPage.p1, 'p'), 'Paragraph should match "p"');
  assert.eq(false, Selectors.is(TestPage.p1, 'span'), 'Paragraph should not match "span"');
  assert.eq(false, Selectors.is(TestPage.p1, 'p.blue'), 'Paragraph should not match "p.blue"');
  assert.eq(true, Selectors.is(TestPage.s3, 'span'), 'Span should match "span"');

  // slightly more advanced selectors
  assert.eq(true, Selectors.is(TestPage.p1, 'div > p'), 'Paragraph should match "p"');
  assert.eq(true, Selectors.is(TestPage.p1, 'div > p:first-child'), 'Paragraph should match "p"');
  assert.eq(true, Selectors.is(TestPage.p2, 'div > p:last-child'), 'Paragraph should match "p"');
  assert.eq(true, Selectors.is(TestPage.s4, 'div > p:last-child span span:last-child'), 'Span should match "span"');

  // Mutating content.
  Class.add(TestPage.p1, 'blue');
  assert.eq(true, Selectors.is(TestPage.p1, 'p.blue'), 'Paragraph should (now) match "p.blue"');

  Remove.remove(TestPage.container);
});
