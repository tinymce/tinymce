import { Assert, UnitTest } from '@ephox/bedrock-client';
import { Optional } from '@ephox/katamari';

import * as Remove from 'ephox/sugar/api/dom/Remove';
import { SugarElement } from 'ephox/sugar/api/node/SugarElement';
import * as Class from 'ephox/sugar/api/properties/Class';
import * as SelectorExists from 'ephox/sugar/api/search/SelectorExists';
import * as SelectorFilter from 'ephox/sugar/api/search/SelectorFilter';
import * as SelectorFind from 'ephox/sugar/api/search/SelectorFind';
import * as Selectors from 'ephox/sugar/api/search/Selectors';
import * as Checkers from 'ephox/sugar/test/Checkers';
import Div from 'ephox/sugar/test/Div';
import * as TestPage from 'ephox/sugar/test/TestPage';

UnitTest.test('SelectorTest', () => {
  // Querying non-element nodes does not throw an error

  const textnode = SugarElement.fromText('');
  const commentnode = SugarElement.fromHtml('<!--a-->');
  Assert.eq('', false, Selectors.is(textnode, 'anything'));
  Assert.eq('', false, Selectors.is(commentnode, 'anything'));
  Assert.eq('', [], Selectors.all('anything', textnode));
  Assert.eq('', [], Selectors.all('anything', commentnode));
  Checkers.checkOpt(Optional.none<SugarElement<Element>>(), Selectors.one('anything', textnode));
  Checkers.checkOpt(Optional.none<SugarElement<Element>>(), Selectors.one('anything', commentnode));
  Assert.eq('', [], SelectorFilter.ancestors(textnode, 'anything'));
  Assert.eq('', [], SelectorFilter.siblings(textnode, 'anything'));
  Assert.eq('', [], SelectorFilter.children(textnode, 'anything'));

  try {
    // IE throws an error running complex queries on an empty div
    // http://jsfiddle.net/spyder/fv9ptr5L/
    const empty = Div();
    Selectors.all('img:not([data-ephox-polish-blob])', empty);
  } catch (e: any) {
    Assert.fail(e);
  }

  TestPage.connect(); // description of structure is in TestPage

  Checkers.checkOpt(Optional.none<SugarElement<Element>>(), Selectors.one('asdf'));

  Checkers.checkOpt(Optional.some(TestPage.p1), SelectorFind.first('p'));
  Checkers.checkOpt(Optional.some(TestPage.p1), Selectors.one('p'));
  Checkers.checkOpt(Optional.none<SugarElement<Element>>(), SelectorFind.sibling(TestPage.s1, 'p'));
  Checkers.checkOpt(Optional.some(TestPage.s3), SelectorFind.sibling(TestPage.s4, 'span'));
  Checkers.checkOpt(Optional.none<SugarElement<Element>>(), SelectorFind.ancestor(TestPage.s1, 'li'));
  Checkers.checkOpt(Optional.some(TestPage.container), SelectorFind.ancestor(TestPage.s4, 'div'));
  Checkers.checkOpt(Optional.some(TestPage.s2), SelectorFind.descendant(TestPage.p2, 'span'));
  Checkers.checkOpt(Optional.some(TestPage.s3), SelectorFind.descendant(TestPage.p2, 'span span'));
  Checkers.checkOpt(Optional.none<SugarElement<Element>>(), SelectorFind.child(TestPage.p2, 'li'));
  Checkers.checkOpt(Optional.some(TestPage.s1), SelectorFind.child(TestPage.p1, 'span'));
  Checkers.checkOpt(Optional.none<SugarElement<Element>>(), SelectorFind.closest(TestPage.p1, 'span'));
  Checkers.checkOpt(Optional.some(TestPage.p1), SelectorFind.closest(TestPage.p1, 'p'));
  Checkers.checkOpt(Optional.some(TestPage.p1), SelectorFind.closest(TestPage.s1, 'p'));
  Checkers.checkOpt(Optional.some(TestPage.p1), SelectorFind.closest(TestPage.t1, 'p'));

  Checkers.checkList([ TestPage.p1, TestPage.p3, TestPage.p2 ], SelectorFilter.all('p'));
  Checkers.checkList([ TestPage.p1, TestPage.p3, TestPage.p2 ], Selectors.all('p'));
  Checkers.checkList([ TestPage.s3, TestPage.s2 ], SelectorFilter.ancestors(TestPage.t4, 'span'));
  Checkers.checkList([ TestPage.d1, TestPage.container ], SelectorFilter.ancestors(TestPage.p3, 'div'));
  Checkers.checkList([], SelectorFilter.ancestors(TestPage.t4, 'table'));
  Checkers.checkList([ TestPage.s1 ], SelectorFilter.siblings(TestPage.t1, '*'));
  Checkers.checkList([], SelectorFilter.siblings(TestPage.t5, '*'));
  Checkers.checkList([ TestPage.s1 ], SelectorFilter.children(TestPage.p1, 'span'));
  Checkers.checkList([], SelectorFilter.children(TestPage.p1, 'li'));
  Checkers.checkList([ TestPage.s1, TestPage.s2, TestPage.s3, TestPage.s4 ], SelectorFilter.descendants(TestPage.container, 'span'));
  Checkers.checkList([], SelectorFilter.descendants(TestPage.container, 'blockquote'));

  Assert.eq('', true, SelectorExists.any('p'));
  Assert.eq('', false, SelectorExists.any('table'));
  Assert.eq('', true, SelectorExists.ancestor(TestPage.t1, 'p'));
  Assert.eq('', false, SelectorExists.ancestor(TestPage.t1, 'span'));
  Assert.eq('', true, SelectorExists.sibling(TestPage.p2, 'p'));
  Assert.eq('', false, SelectorExists.sibling(TestPage.t1, 'p'));
  Assert.eq('', true, SelectorExists.child(TestPage.p1, 'span'));
  Assert.eq('', false, SelectorExists.child(TestPage.p2, 'label'));
  Assert.eq('', true, SelectorExists.descendant(TestPage.p2, 'span'));
  Assert.eq('', false, SelectorExists.closest(TestPage.p1, 'span'));
  Assert.eq('', true, SelectorExists.closest(TestPage.p1, 'p'));
  Assert.eq('', true, SelectorExists.closest(TestPage.s1, 'p'));
  Assert.eq('', true, SelectorExists.closest(TestPage.t1, 'p'));

  // simple selectors
  Assert.eq('Text node should not match "p"', false, Selectors.is(TestPage.t1, 'p'));
  Assert.eq('Paragraph should match "p"', true, Selectors.is(TestPage.p1, 'p'));
  Assert.eq('Paragraph should not match "span"', false, Selectors.is(TestPage.p1, 'span'));
  Assert.eq('Paragraph should not match "p.blue"', false, Selectors.is(TestPage.p1, 'p.blue'));
  Assert.eq('Span should match "span"', true, Selectors.is(TestPage.s3, 'span'));

  // slightly more advanced selectors
  Assert.eq('Paragraph should match "p"', true, Selectors.is(TestPage.p1, 'div > p'));
  Assert.eq('Paragraph should match "p"', true, Selectors.is(TestPage.p1, 'div > p:first-child'));
  Assert.eq('Paragraph should match "p"', true, Selectors.is(TestPage.p2, 'div > p:last-child'));
  Assert.eq('Span should match "span"', true, Selectors.is(TestPage.s4, 'div > p:last-child span span:last-child'));

  // Mutating content.
  Class.add(TestPage.p1, 'blue');
  Assert.eq('Paragraph should (now) match "p.blue"', true, Selectors.is(TestPage.p1, 'p.blue'));

  Remove.remove(TestPage.container);
});
