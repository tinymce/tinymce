test(
  'IsRootTest',

  [
    'ephox.katamari.api.Fun',
    'ephox.katamari.api.Option',
    'ephox.sugar.api.dom.Compare',
    'ephox.sugar.api.search.PredicateExists',
    'ephox.sugar.api.search.PredicateFilter',
    'ephox.sugar.api.search.PredicateFind',
    'ephox.sugar.api.dom.Remove',
    'ephox.sugar.api.search.SelectorExists',
    'ephox.sugar.api.search.SelectorFilter',
    'ephox.sugar.api.search.SelectorFind',
    'ephox.sugar.api.search.Traverse',
    'ephox.sugar.test.Checkers',
    'ephox.sugar.test.TestPage'
  ],

  function (Fun, Option, Compare, PredicateExists, PredicateFilter, PredicateFind, Remove, SelectorExists, SelectorFilter, SelectorFind, Traverse, Checkers, TestPage) {
    TestPage.connect(); // description of structure is in TestPage

    var isRoot = function (e) {
      return Compare.eq(TestPage.d1, e);
    };

    var checkNone = Fun.curry(Checkers.checkOpt, Option.none());

    checkNone(SelectorFind.ancestor(TestPage.t6, 'li', isRoot));
    checkNone(SelectorFind.ancestor(TestPage.t6, 'ol,ul', isRoot));
    checkNone(PredicateFind.ancestor(TestPage.t6, Checkers.isName('li'), isRoot));

    Checkers.checkOpt(Option.some(TestPage.d1), SelectorFind.ancestor(TestPage.t6, 'div', isRoot));
    Checkers.checkOpt(Option.some(TestPage.d1), PredicateFind.ancestor(TestPage.t6, Checkers.isName('div'), isRoot));

    checkNone(SelectorFind.closest(TestPage.t6, 'li', isRoot));
    checkNone(SelectorFind.closest(TestPage.t6, 'ol,ul', isRoot));
    checkNone(SelectorFind.closest(TestPage.d1, 'ol,ul', isRoot));
    checkNone(PredicateFind.closest(TestPage.t6, Checkers.isName('li'), isRoot));
    checkNone(PredicateFind.closest(TestPage.d1, Checkers.isName('li'), isRoot));

    Checkers.checkOpt(Option.some(TestPage.d1), SelectorFind.closest(TestPage.t6, 'div', isRoot));
    Checkers.checkOpt(Option.some(TestPage.d1), SelectorFind.closest(TestPage.d1, 'div', isRoot));
    Checkers.checkOpt(Option.some(TestPage.d1), PredicateFind.closest(TestPage.t6, Checkers.isName('div'), isRoot));
    Checkers.checkOpt(Option.some(TestPage.d1), PredicateFind.closest(TestPage.d1, Checkers.isName('div'), isRoot));

    Checkers.checkList([ TestPage.d1 ], SelectorFilter.ancestors(TestPage.p3, '*', isRoot));
    Checkers.checkList([ TestPage.d1 ], PredicateFilter.ancestors(TestPage.p3, Fun.constant(true), isRoot));

    assert.eq(false, SelectorExists.closest(TestPage.p3, 'li', isRoot));
    assert.eq(false, SelectorExists.closest(TestPage.p3, 'ol,ul', isRoot));
    assert.eq(false, PredicateExists.closest(TestPage.p3, Checkers.isName('li'), isRoot));

    assert.eq(true, SelectorExists.closest(TestPage.p3, 'div', isRoot));
    assert.eq(true, SelectorExists.closest(TestPage.d1, 'div', isRoot));
    assert.eq(true, PredicateExists.closest(TestPage.p3, Checkers.isName('div'), isRoot));
    assert.eq(true, PredicateExists.closest(TestPage.d1, Checkers.isName('div'), isRoot));

    assert.eq(false, SelectorExists.ancestor(TestPage.p3, 'li', isRoot));
    assert.eq(false, SelectorExists.ancestor(TestPage.p3, 'ol,ul', isRoot));
    assert.eq(false, PredicateExists.ancestor(TestPage.p3, Checkers.isName('li'), isRoot));

    assert.eq(true, SelectorExists.ancestor(TestPage.p3, 'div', isRoot));
    assert.eq(true, PredicateExists.ancestor(TestPage.p3, Checkers.isName('div'), isRoot));

    Checkers.checkList([TestPage.d1], Traverse.parents(TestPage.p3, isRoot));
    Checkers.checkList([TestPage.p3, TestPage.d1], Traverse.parents(TestPage.t6, isRoot));

    Remove.remove(TestPage.container);
  }
);