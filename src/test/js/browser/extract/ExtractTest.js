test(
  'ExtractTest',

  [
    'ephox.phoenix.extract.Extract',
    'ephox.phoenix.ghetto.extract.GhettoExtract',
    'ephox.phoenix.test.Page',
    'ephox.sugar.api.Compare'
  ],

  function (Extract, GhettoExtract, Page, Compare) {

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
  }
);

test(
  'From',

  [
    'ephox.boss.api.DomUniverse',
    'ephox.compass.Arr',
    'ephox.phoenix.extract.Extract',
    'ephox.phoenix.test.Page',
    'ephox.sugar.api.Element',
    'ephox.sugar.api.Text'
  ],

  function (DomUniverse, Arr, Extract, Page, Element, Text) {
    var check = function (expected, input) {
      var rawActual = Extract.from(input);
      var actual = Arr.map(rawActual, function (x) {
        return x.fold(function () {
          return '\\w';
        }, function () {
          return '-';
        }, function (t) {
          return Text.get(t);
        });
      }).join('');
      assert.eq(expected, actual);
    };

    // IMPORTANT: Otherwise CSS display does not work.
    var page = Page();
    page.connect();

    check('', Element.fromText(''));
    check('\\wFirst paragraph\\w', page.p1);
    check('\\w\\wFirst paragraph\\w\\wSecond here is something\\w\\wMore data\\w\\w', page.div1);
    check('\\w\\w\\wFirst paragraph\\w\\wSecond here is something\\w\\wMore data\\w\\w\\wNext \\wSection now\\w\\w\\w', page.container);
  }
);


/*
<container><div1><p1>{t1:First paragraph}<p2>{t2:Second }<s1>{t3:here}<s2>{t4: is }<s3>{t5:something}
  <p3>{t6:More data}
  <div2>{t7:Next }<p4>{t8:Section }<s4>{t9:now}{t10:w}

  */