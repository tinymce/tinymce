test(
  'parent :: Subset',

  [
    'ephox.compass.Arr',
    'ephox.perhaps.Option',
    'ephox.robin.api.Parent',
    'ephox.sugar.api.Attr',
    'ephox.sugar.api.Element',
    'ephox.sugar.api.SelectorFind'
  ],

  function (Arr, Option, Parent, Attr, Element, SelectorFind) {
    var check = function (expected, s, f) {
      var container = Element.fromTag('div');
      container.dom().innerHTML =
        '<ol class="one-nine" style="list-style-type: decimal;">' +
          '<li class="one">One</li>' +
          '<li class="two">Two</li>' +
          '<ol class="three-five" style="list-style-type: lower-alpha;">' +
            '<li class="three">three</li>' +
            '<li class="four">four</li>' +
            '<li class="five">five</li>' +
          '</ol>' +
          '<li class="six">six</li>' +
          '<ol class="seven-nine" style="list-style-type: lower-alpha;">' +
            '<ol class="seven-eight" style="list-style-type: lower-roman;">' +
              '<li class="seven">seven</li>' +
              '<li class="eight">eight</li>' +
            '</ol>' +
            '<li class="nine">nine</li>' +
          '</ol>' +
        '</ol>';

      var parent = SelectorFind.descendant(container, '.' + s).getOrDie();
      var child = SelectorFind.descendant(container, '.' + f).getOrDie();
      var subset = Parent.subset(parent, child);
      expected.fold(function () {
        assert.eq(true, subset.isNone());
      }, function (exp) {
        subset.fold(function () {
          assert.fail('Expected some, was none');
        }, function (ss) {
          assert.eq(exp, Arr.map(ss, function (x) { return Attr.get(x, 'class'); }));
        });
      });

    };

    check(Option.some(['three-five']), 'three-five', 'five');
    check(Option.some(['three-five']), 'five', 'three-five');
    check(Option.some(['two', 'three-five']), 'two', 'five');
    check(Option.some(['two', 'three-five', 'six', 'seven-nine']), 'two', 'eight');

  }
);
