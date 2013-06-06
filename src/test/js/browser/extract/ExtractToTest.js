test(
  'Extract.extractTo',

  [
    'ephox.phoenix.extract.Extract',
    'ephox.phoenix.test.Page',
    'ephox.sugar.api.Compare'
  ],

  function (Extract, Page, Compare) {

    var check = function (eNode, eOffset, cNode, cOffset, predicate) {
      var actual = Extract.extractTo(cNode, cOffset, predicate);
      assert.eq(true, Compare.eq(eNode, actual.element()));
      assert.eq(eOffset, actual.offset());
    };

    var page = Page();

    check(page.div1, 'First paragraphSecond here'.length + 1, page.t4, 1, function (element) {
      return Compare.eq(element, page.div1);
    });

    page.disconnect();
  }
);