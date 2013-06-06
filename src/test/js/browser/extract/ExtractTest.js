test(
  'extract.Extract.extract',

  [
    'ephox.phoenix.extract.Extract',
    'ephox.phoenix.test.Page',
    'ephox.sugar.api.Compare'
  ],

  function (Extract, Page, Compare) {

    var check = function (eNode, eOffset, cNode, cOffset) {
      var actual = Extract.extract(cNode, cOffset);
      assert.eq(true, Compare.eq(eNode, actual.element()));
      assert.eq(eOffset, actual.offset());
    };

    var page = Page();
        
    check(page.p1, 1, page.t1, 1);
    check(page.p1, 5, page.t1, 5);
    check(page.s2, 1, page.t4, 1);
    check(page.s3, 0, page.t5, 0);

    page.disconnect();
  }
);