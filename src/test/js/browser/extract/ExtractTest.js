test(
  'ExtractTest',

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
    
    check(Page.p1, 1, Page.t1, 1);
    check(Page.p1, 5, Page.t1, 5);
    check(Page.s2, 1, Page.t4, 1);
    check(Page.s3, 0, Page.t5, 0);
  }
);

/*
<container><div1><p1>{t1:First paragraph}<p2>{t2:Second }<s1>{t3:here}<s2>{t4: is }<s3>{t5:something}
  <p3>{t6:More data}
  <div2>{t7:Next }<p4>{t8:Section }<s4>{t9:now}{t10:w}

  */