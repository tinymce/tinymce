import { assert, UnitTest } from '@ephox/bedrock-client';
import { HTMLLIElement, HTMLSpanElement, Text } from '@ephox/dom-globals';
import { Fun, Option } from '@ephox/katamari';
import * as Remove from 'ephox/sugar/api/dom/Remove';
import Element from 'ephox/sugar/api/node/Element';
import * as Node from 'ephox/sugar/api/node/Node';
import * as PredicateExists from 'ephox/sugar/api/search/PredicateExists';
import * as PredicateFilter from 'ephox/sugar/api/search/PredicateFilter';
import * as PredicateFind from 'ephox/sugar/api/search/PredicateFind';
import * as Checkers from 'ephox/sugar/test/Checkers';
import * as TestPage from 'ephox/sugar/test/TestPage';

UnitTest.test('PredicateTest', () => {
  TestPage.connect(); // description of structure is in TestPage

  Checkers.checkOpt(Option.some(TestPage.p1), PredicateFind.first(Checkers.isName('p')));

  Checkers.checkOpt(Option.none<Element<Text>>(), PredicateFind.sibling(TestPage.t5, Node.isText));
  Checkers.checkOpt(Option.some(TestPage.s3), PredicateFind.sibling(TestPage.s4, Checkers.isName('span')));

  Checkers.checkOpt(Option.none<Element<HTMLLIElement>>(), PredicateFind.ancestor(TestPage.t4, Checkers.isName('li')));
  Checkers.checkOpt(Option.some(TestPage.container), PredicateFind.ancestor(TestPage.s4, Checkers.isName('div')));

  Checkers.checkOpt(Option.none<Element<HTMLSpanElement>>(), PredicateFind.ancestor(TestPage.s2, Checkers.isName('span')));
  Checkers.checkOpt(Option.some(TestPage.s2), PredicateFind.closest(TestPage.s2, Checkers.isName('span')));

  Checkers.checkOpt(Option.some(TestPage.s2), PredicateFind.descendant(TestPage.p2, Checkers.isName('span')));
  Checkers.checkOpt(Option.some(TestPage.t4), PredicateFind.descendant(TestPage.p2, Node.isText));

  Checkers.checkOpt(Option.none<Element<Text>>(), PredicateFind.child(TestPage.p2, Node.isText));
  Checkers.checkOpt(Option.some(TestPage.t4), PredicateFind.child(TestPage.s3, Node.isText));

  Checkers.checkList([ TestPage.p1, TestPage.p3, TestPage.p2 ], PredicateFilter.all(Checkers.isName('p')));
  Checkers.checkList([ TestPage.s3, TestPage.s2 ], PredicateFilter.ancestors(TestPage.t4, Checkers.isName('span')));
  Checkers.checkList([ TestPage.d1, TestPage.container ], PredicateFilter.ancestors(TestPage.p3, Checkers.isName('div')));
  Checkers.checkList([], PredicateFilter.ancestors(TestPage.t4, Node.isText));
  Checkers.checkList([ TestPage.s1, TestPage.t3 ], PredicateFilter.siblings(TestPage.t1, Fun.constant(true)));
  Checkers.checkList([], PredicateFilter.siblings(TestPage.t5, Fun.constant(true)));
  Checkers.checkList([ TestPage.t1, TestPage.t3 ], PredicateFilter.children(TestPage.p1, Node.isText));
  Checkers.checkList([ TestPage.s1 ], PredicateFilter.children(TestPage.p1, Checkers.isName('span')));
  Checkers.checkList([], PredicateFilter.children(TestPage.t2, Fun.constant(true)));
  Checkers.checkList([ TestPage.s1, TestPage.s2, TestPage.s3, TestPage.s4 ], PredicateFilter.descendants(TestPage.container, Checkers.isName('span')));
  Checkers.checkList([], PredicateFilter.descendants(TestPage.container, Checkers.isName('blockquote')));

  assert.eq(true, PredicateExists.any(Checkers.isName('p')));
  assert.eq(false, PredicateExists.any(Checkers.isName('table')));
  assert.eq(true, PredicateExists.ancestor(TestPage.t1, Checkers.isName('p')));
  assert.eq(false, PredicateExists.ancestor(TestPage.p1, Checkers.isName('p')));
  assert.eq(false, PredicateExists.ancestor(TestPage.t1, Checkers.isName('span')));
  assert.eq(true, PredicateExists.closest(TestPage.t1, Checkers.isName('p')));
  assert.eq(true, PredicateExists.closest(TestPage.p1, Checkers.isName('p')));
  assert.eq(false, PredicateExists.closest(TestPage.t1, Checkers.isName('span')));
  assert.eq(true, PredicateExists.sibling(TestPage.p2, Checkers.isName('p')));
  assert.eq(false, PredicateExists.sibling(TestPage.t1, Checkers.isName('p')));
  assert.eq(true, PredicateExists.child(TestPage.p1, Node.isText));
  assert.eq(false, PredicateExists.child(TestPage.p2, Node.isText));
  assert.eq(true, PredicateExists.descendant(TestPage.p2, Node.isText));
  assert.eq(false, PredicateExists.descendant(TestPage.s1, Checkers.isName('p')));

  Remove.remove(TestPage.container);
});
