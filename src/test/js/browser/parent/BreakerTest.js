test(
  'parent :: Breaker',

  [
    'ephox.robin.api.Parent',
    'ephox.sugar.api.Element',
    'ephox.sugar.api.Html',
    'ephox.sugar.api.SelectorFind'
  ],

  function (Parent, Element, Html, SelectorFind) {

    var check = function (expected, p, c) {
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

      var parent = SelectorFind.descendant(container, '.' + p).getOrDie();
      var child = SelectorFind.descendant(container, '.' + c).getOrDie();
      Parent.breakAt(parent, child);
      assert.eq(expected, Html.get(container));
    };

    check('<ol class="one-nine" style="list-style-type: decimal;">' +
          '<li class="one">One</li>' +
          '<li class="two">Two</li>' +
          '<ol class="three-five" style="list-style-type: lower-alpha;">' +
            '<li class="three">three</li>' +
            '<li class="four">four</li>' +
            '<li class="five">five</li>' +
          '</ol>' +
          '<ol>' +
          '</ol>' +
          '<li class="six">six</li>' +
          '<ol class="seven-nine" style="list-style-type: lower-alpha;">' +
            '<ol class="seven-eight" style="list-style-type: lower-roman;">' +
              '<li class="seven">seven</li>' +
              '<li class="eight">eight</li>' +
            '</ol>' +
            '<li class="nine">nine</li>' +
          '</ol>' +
        '</ol>', 'three-five', 'five');

    check(
        '<ol class="one-nine" style="list-style-type: decimal;">' +
          '<li class="one">One</li>' +
          '<li class="two">Two</li>' +
          '<ol class="three-five" style="list-style-type: lower-alpha;">' +
            '<li class="three">three</li>' +
            '<li class="four">four</li>' +
            '<li class="five">five</li>' +
          '</ol>' +
          '<li class="six">six</li>' +
        '</ol>' +
        '<ol>' +
          '<ol class="seven-nine" style="list-style-type: lower-alpha;">' +
            '<ol class="seven-eight" style="list-style-type: lower-roman;">' +
              '<li class="seven">seven</li>' +
              '<li class="eight">eight</li>' +
            '</ol>' +
            '<li class="nine">nine</li>' +
          '</ol>' +
        '</ol>', 'one-nine', 'six');
  }
);
