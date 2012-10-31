test(
  'RangeTest',

  [
    'ephox.compass.Arr',
    'ephox.phoenix.wrap.Wrapper',
    'ephox.phoenix.wrap.Wraps',
    'ephox.sugar.api.Class',
    'ephox.sugar.api.Element',
    'ephox.sugar.api.Html',
    'ephox.sugar.api.Insert',
    'ephox.sugar.api.InsertAll',
    'ephox.sugar.api.Remove',
    'ephox.sugar.api.SelectorFind',
    'ephox.sugar.api.Traverse'
  ],

  function (Arr, Wrapper, Wraps, Class, Element, Html, Insert, InsertAll, Remove, SelectorFind, Traverse) {

    var root = Element.fromTag('div');
    var body = SelectorFind.first('body').getOrDie();

    Insert.append(body, root);

    var s1 = Element.fromTag('span');
    var s2 = Element.fromTag('span');
    var t1 = Element.fromText('this is');
    var t2 = Element.fromText(' athens!');

    var t = Element.fromText;

    Insert.append(s1, t1);
    Insert.append(s1, s2);
    Insert.append(s2, t2);
    Insert.append(root, s1);

    var s = function (tag, xs) {
      var element = Element.fromTag(tag);
      InsertAll.append(element, xs);
      return element;
    };

    var check = function (input, f) {
      var container = Element.fromTag('div');
      Insert.append(root, container);
      InsertAll.append(container, input);
      f(container);
      Remove.remove(container);
    };

    var checker = function (expected, p1, offset1, p2, offset2, input, initial) {
      check(input, function (container) {
        assert.eq(initial, Html.get(container));
        var first = c(container, p1);
        var second = c(container, p2);
        Wrapper.wrapWith(first, offset1, second, offset2, function () {
          var basic = Element.fromTag('span');
          Class.add(basic, 'me');
          return Wraps.basic(basic);
        });

        assert.eq(expected, Html.get(container));
      });
    };

    var c = function (element, paths) {
      var children = Traverse.children(element);
      return paths.length === 0 ? element : c(children[paths[0]], paths.slice(1));
    };

    check([s('span', [t('this is'), s('span', [t(' athens!')])])], function (container) {
      assert.eq('<span>this is<span> athens!</span></span>', Html.get(container));
      var first = c(container, [0, 0]);
      var second = c(container, [0, 1, 0]);
      Wrapper.wrapWith(first, 0, second, 4, function () {
        var basic = Element.fromTag('span');
        Class.add(basic, 'me');
        return Wraps.basic(basic);
      });
      assert.eq('<span><span class="me">this is</span><span><span class="me"> ath</span>ens!</span></span>', Html.get(container));
    });

    checker(
      '<span><span class="me">this is</span><br><span><span class="me"> ath</span>ens!</span></span>',
      [0, 0], 0,
      [0, 2, 0], 4,
      [s('span', [
        t('this is'),
        Element.fromTag('br'),
        s('span', [
          t(' athens!')
        ])
      ])],
      '<span>this is<br><span> athens!</span></span>'
    );

    Remove.remove(root);

  }
);
