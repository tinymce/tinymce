test(
  'pathway :: Between',

  [
    'ephox.compass.Arr',
    'ephox.robin.api.Pathway',
    'ephox.sugar.api.Attr',
    'ephox.sugar.api.Element',
    'ephox.sugar.api.Elements',
    'ephox.sugar.api.InsertAll',
    'ephox.sugar.api.Node',
    'ephox.sugar.api.SelectorFind',
    'ephox.sugar.api.Text'
  ],

  function (Arr, Pathway, Attr, Element, Elements, InsertAll, Node, SelectorFind, Text) {
    var container = Element.fromTag('body');
    var contents = Elements.fromHtml(
      '<p id="p1">This is the first paragraph</p>' +
      '<ol id="a">' +
        '<li id="s1">One</li>' +
        '<span id="ol-span1">' +
          '<li id="s2">Two</li>' +
        '</span>' +
        '<span id="ol-span2">' +
          '<li id="s3">Three</li>' +
        '</span>' +
      '</ol>');
    InsertAll.append(container, contents);

    var $ = function (clazz) {
      return SelectorFind.descendant(container, '#' + clazz).getOrDie();
    };

    var conform = function (result) {
      return Arr.map(result, function (x) {
        return Node.isText(x) ? '<<' + Text.get(x) + '>>' : (Node.name(x) + '.' + Attr.get(x, 'id'));
      });
    };

    var check = function (expected, start, end) {
      var actual = Pathway.between(start, end);
      assert.eq(expected, conform(actual));
    };

    check([ 'p.p1', 'li.s1', 'span.ol-span1', 'li.s3' ], $('p1'), $('s3'));
    check([ 'p.p1', 'li.s1', 'li.s2' ], $('p1'), $('s2'));
  }
);