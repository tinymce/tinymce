import { Assert, describe, it } from '@ephox/bedrock-client';
import { Fun, Optional } from '@ephox/katamari';

import * as Remove from 'ephox/sugar/api/dom/Remove';
import { SugarElement } from 'ephox/sugar/api/node/SugarElement';
import * as SugarNode from 'ephox/sugar/api/node/SugarNode';
import * as PredicateExists from 'ephox/sugar/api/search/PredicateExists';
import * as PredicateFilter from 'ephox/sugar/api/search/PredicateFilter';
import * as PredicateFind from 'ephox/sugar/api/search/PredicateFind';
import * as Checkers from 'ephox/sugar/test/Checkers';
import * as TestPage from 'ephox/sugar/test/TestPage';

describe('PredicateTest', () => {
  it('TBA: Structure check', () => {
    TestPage.connect(); // description of structure is in TestPage

    Checkers.checkOpt(Optional.some(TestPage.p1), PredicateFind.first(Checkers.isName('p')));

    Checkers.checkOpt(Optional.none<SugarElement<Text>>(), PredicateFind.sibling(TestPage.t5, SugarNode.isText));
    Checkers.checkOpt(Optional.some(TestPage.s3), PredicateFind.sibling(TestPage.s4, Checkers.isName('span')));

    Checkers.checkOpt(Optional.none<SugarElement<HTMLLIElement>>(), PredicateFind.ancestor(TestPage.t4, Checkers.isName('li')));
    Checkers.checkOpt(Optional.some(TestPage.container), PredicateFind.ancestor(TestPage.s4, Checkers.isName('div')));

    Checkers.checkOpt(Optional.none<SugarElement<HTMLSpanElement>>(), PredicateFind.ancestor(TestPage.s2, Checkers.isName('span')));
    Checkers.checkOpt(Optional.some(TestPage.s2), PredicateFind.closest(TestPage.s2, Checkers.isName('span')));

    Checkers.checkOpt(Optional.some(TestPage.s2), PredicateFind.descendant(TestPage.p2, Checkers.isName('span')));
    Checkers.checkOpt(Optional.some(TestPage.t4), PredicateFind.descendant(TestPage.p2, SugarNode.isText));

    Checkers.checkOpt(Optional.none<SugarElement<Text>>(), PredicateFind.child(TestPage.p2, SugarNode.isText));
    Checkers.checkOpt(Optional.some(TestPage.t4), PredicateFind.child(TestPage.s3, SugarNode.isText));

    Checkers.checkList([ TestPage.p1, TestPage.p3, TestPage.p2 ], PredicateFilter.all(Checkers.isName('p')));
    Checkers.checkList([ TestPage.s3, TestPage.s2 ], PredicateFilter.ancestors(TestPage.t4, Checkers.isName('span')));
    Checkers.checkList([ TestPage.d1, TestPage.container ], PredicateFilter.ancestors(TestPage.p3, Checkers.isName('div')));
    Checkers.checkList([], PredicateFilter.ancestors(TestPage.t4, SugarNode.isText));
    Checkers.checkList([ TestPage.s1, TestPage.t3 ], PredicateFilter.siblings(TestPage.t1, Fun.always));
    Checkers.checkList([], PredicateFilter.siblings(TestPage.t5, Fun.always));
    Checkers.checkList([ TestPage.t1, TestPage.t3 ], PredicateFilter.children(TestPage.p1, SugarNode.isText));
    Checkers.checkList([ TestPage.s1 ], PredicateFilter.children(TestPage.p1, Checkers.isName('span')));
    Checkers.checkList([], PredicateFilter.children(TestPage.t2, Fun.always));
    Checkers.checkList([ TestPage.s1, TestPage.s2, TestPage.s3, TestPage.s4 ], PredicateFilter.descendants(TestPage.container, Checkers.isName('span')));
    Checkers.checkList([], PredicateFilter.descendants(TestPage.container, Checkers.isName('blockquote')));

    Assert.eq('', true, PredicateExists.any(Checkers.isName('p')));
    Assert.eq('', false, PredicateExists.any(Checkers.isName('table')));
    Assert.eq('', true, PredicateExists.ancestor(TestPage.t1, Checkers.isName('p')));
    Assert.eq('', false, PredicateExists.ancestor(TestPage.p1, Checkers.isName('p')));
    Assert.eq('', false, PredicateExists.ancestor(TestPage.t1, Checkers.isName('span')));
    Assert.eq('', true, PredicateExists.closest(TestPage.t1, Checkers.isName('p')));
    Assert.eq('', true, PredicateExists.closest(TestPage.p1, Checkers.isName('p')));
    Assert.eq('', false, PredicateExists.closest(TestPage.t1, Checkers.isName('span')));
    Assert.eq('', true, PredicateExists.sibling(TestPage.p2, Checkers.isName('p')));
    Assert.eq('', false, PredicateExists.sibling(TestPage.t1, Checkers.isName('p')));
    Assert.eq('', true, PredicateExists.child(TestPage.p1, SugarNode.isText));
    Assert.eq('', false, PredicateExists.child(TestPage.p2, SugarNode.isText));
    Assert.eq('', true, PredicateExists.descendant(TestPage.p2, SugarNode.isText));
    Assert.eq('', false, PredicateExists.descendant(TestPage.s1, Checkers.isName('p')));

    Remove.remove(TestPage.container);
  });
});
