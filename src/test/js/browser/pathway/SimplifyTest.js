test(
  'pathway :: Simplify',

  [
    'ephox.compass.Arr',
    'ephox.robin.api.Pathway',
    'ephox.sugar.api.Compare',
    'ephox.sugar.api.Element',
    'ephox.sugar.api.Elements',
    'ephox.sugar.api.Insert',
    'ephox.sugar.api.InsertAll',
    'ephox.sugar.api.SelectorFind'
  ],

  function (Arr, Pathway, Compare, Element, Elements, Insert, InsertAll, SelectorFind) {

    var container = Element.fromTag('div');
    InsertAll.append(container, Elements.fromHtml(
      '<div class="a">' +
        '<div class="a-a">' +
          '<div class="a-a-a"></div>' +
          '<div class="a-a-b"></div>' +
        '</div>' +
        '<div class="a-b">' +
          '<div class="a-b-a">' +
            '<div class="a-b-a-a"></div>' +
          '</div>' +
        '</div>' +
      '</div>' +
      '<div class="b">' +
        '<div class="b-a"></div>' +
      '</div>'));


    var body = SelectorFind.first('body').getOrDie();
    Insert.append(body, container);

    var $ = function (clazz) {
      return SelectorFind.descendant(container, '.' + clazz).getOrDie();
    };

    var check = function (expected, actual) {
      assert.eq(expected.length, actual.length);
      assert.eq(true, Arr.forall(expected, function (x, i) {
        return Compare.eq($(x), actual[i]);
      }));
    };

    // sanity check
    check(['a', 'b'], [ $('a'), $('b') ]);
    check([ 'a' ], Pathway.simplify( [ $('a') ]));
    check([ 'a' ], Pathway.simplify( [ $('a-b'), $('a'), $('a-a-a') ]));
  }
);