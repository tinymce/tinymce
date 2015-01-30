test(
  'FracturesTest',

  [
    'ephox.boss.api.DomUniverse',
    'ephox.boss.api.Gene',
    'ephox.boss.api.TestUniverse',
    'ephox.boss.api.TextGene',
    'ephox.robin.clumps.Fractures',
    'ephox.sugar.api.Body',
    'ephox.sugar.api.Compare',
    'ephox.sugar.api.Element',
    'ephox.sugar.api.Html',
    'ephox.sugar.api.Insert',
    'ephox.sugar.api.InsertAll'
  ],

  function (DomUniverse, Gene, TestUniverse, TextGene, Fractures, Body, Compare, Element, Html, Insert, InsertAll) {
    var container = Element.fromTag('div');
    var isRoot = function (item) {
      return Compare.eq(item, container);
    };

    var a = Element.fromTag('span');
    var aa = Element.fromTag('span');
    var aaa = Element.fromText('aaa');
    var aab = Element.fromText('aab');
    var aac = Element.fromText('aac');
    var ab = Element.fromText('ab');
    var ac = Element.fromTag('span');
    var aca = Element.fromText('aca');
    var acb = Element.fromTag('span');
    var acba = Element.fromText('acba');
    var acbb = Element.fromTag('span');
    var acbba = Element.fromText('acbba');

    InsertAll.append(container, [ a ]);
    InsertAll.append(a, [ aa, ab, ac ]);
    InsertAll.append(aa, [ aaa, aab, aac ]);
    InsertAll.append(ac, [ aca, acb ]);
    InsertAll.append(acb, [ acba, acbb ]);
    InsertAll.append(acbb, [ acbba ]);

    Insert.append(Body.body(), container);

    var check = function (expected, start, finish, _doc) {
      var doc = DomUniverse();
      var actual = Fractures.fracture(doc, isRoot, start, finish);
      actual.each(function (act) {
        var wrapper = doc.create().nu('b');
        if (act.length > 0) {
          doc.insert().before(act[0], wrapper);
          doc.insert().appendAll(wrapper, act);
        }
      });
      assert.eq(expected, Html.get(container));
    };

    // check(
    //   '<span><span></span><b><span>aaaaabaac</span>ab<span>aca<span>acba<span>acbba</span></span></span></span>', 
    //   aaa, acbba
    // );

    // Needs ancestor scanning and breaker.left
    // check('root(p(font(span,bold(span("text")))))', 'c', 'b', TestUniverse(Gene('root', 'root', [
    //   Gene('p1', 'p', [
    //     Gene('a', 'font', [
    //       Gene('b', 'span', [
    //         TextGene('c', 'text')
    //       ])
    //     ])
    //   ])
    // ])));

    /* 
    Basic
    'root(' +
      'span(' +
        'span(' +
          '"aaa",' +
          '"aab",' +
          '"aac"' +
        '),' +
        '"ab",' +
        'span(' +
          '"aca",' +
          'span(' +
            '"acba",' +
            'span(' +
              '"acbba"' +
            ')' +
          ')' +
        ')' + 
      '),' +
      '"b",' +
      'span(' +
        '"ca",' +
        'span(' +
          'span(' +
            '"cbaa",' +
            '"cbab"' +
          '),' +
          '"cbb"' +
        ')' +
      ')' +
    ')',
    */

    // check(
    //   'root(span(span(bold("aaa","aab","aac")),"ab",span("aca",span("acba",span("acbba")))),"b",span("ca",span(span("cbaa","cbab"),"cbb")))',
    //   'aaa', 'aac'
    // );

    // check(
    //   'root(' +
    //     'span(' +
    //       'span(' +
    //         'bold(' +
    //           '"aaa",' +
    //           '"aab",' +
    //           '"aac"' +
    //         ')' +
    //       '),' +
    //       '"ab",' +
    //       'span(' +
    //         '"aca",' +
    //         'span(' +
    //           '"acba",' +
    //           'span(' +
    //             '"acbba"' +
    //           ')' +
    //         ')' +
    //       ')' + 
    //     '),' +
    //     '"b",' +
    //     'span(' +
    //       '"ca",' +
    //       'span(' +
    //         'span(' +
    //           '"cbaa",' +
    //           '"cbab"' +
    //         '),' +
    //         '"cbb"' +
    //       ')' +
    //     ')' +
    //   ')',
    //   'aaa', 'aac');

  }
);