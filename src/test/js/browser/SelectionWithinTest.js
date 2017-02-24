test(
  'Browser Test: SelectionTest',

  [
    'ephox.katamari.api.Arr',
    'ephox.katamari.api.Obj',
    'ephox.sugar.api.dom.InsertAll',
    'ephox.sugar.api.node.Body',
    'ephox.sugar.api.node.Element',
    'ephox.sugar.api.node.Node',
    'ephox.sugar.api.properties.Html',
    'ephox.sugar.api.selection.Selection',
    'ephox.sugar.api.selection.WindowSelection',
    'global!setTimeout',
    'global!window'
  ],

  function (Arr, Obj, InsertAll, Body, Element, Node, Html, Selection, WindowSelection, setTimeout, window) {
    var p1 = Element.fromHtml('<p>This is the <strong>first</strong> paragraph</p>');
    var p2 = Element.fromHtml('<p>This is the <em>second</em> paragraph</p>');

    InsertAll.append(Body.body(), [ p1, p2 ]);

    var assertWithin = function (expected, outer) {
      WindowSelection.setToElement(window, outer);
      WindowSelection.getExact(window).fold(function () {
        assert.fail('Selection should be wrapping: ' + Html.getOuter(outer));
      }, function (sel) {
        Obj.each(expected, function (num, tag) {
          var actual = WindowSelection.findWithin(
            window,
            Selection.exact(sel.start(), sel.soffset(), sel.finish(), sel.foffset()),
            tag
          );
          assert.eq(
            num, actual.length, 'Incorrect number of ' + tag + ' tags.\n' +
            'Expected: ' + num + ', but was: ' + actual.length
          );
          assert.eq(true, Arr.forall(actual, function (a) {
            return Node.name(a) === tag;
          }), 'All tags must be: ' + tag);
        });
      });
    };

    assertWithin({
      strong: 1,
      em: 0
    }, p1);

    assertWithin({
      strong: 0,
      em: 1
    }, p2);
  }
);
