test(
  'FindTest',

  [
    'ephox.phoenix.extract.Find',
    'ephox.phoenix.test.Page',
    'ephox.sugar.api.Compare'
  ],

  function (Find, Page, Compare) {

    var check = function (eNode, eOffset, pNode, pOffset) {
      var actual = Find.find(pNode, pOffset).getOrDie();
      assert.eq(true, Compare.eq(eNode, actual.element()));
      assert.eq(eOffset, actual.offset());
    };

    var checkNone = function (pNode, pOffset) {
      assert.eq(true, Find.find(pNode, pOffset).isNone());
    };

    check(Page.t1, 1, Page.p1, 1);
    check(Page.t1, 5, Page.p1, 5);
    check(Page.t4, 1, Page.p2, 12);
    check(Page.t5, 1, Page.p2, 16);

    checkNone(Page.p1, 16);
  }
);