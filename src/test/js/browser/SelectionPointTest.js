test(
  'Browser Test: SelectionRectanglesTest',

  [
    'ephox.sugar.api.dom.Hierarchy',
    'ephox.sugar.api.dom.InsertAll',
    'ephox.sugar.api.dom.Remove',
    'ephox.sugar.api.node.Body',
    'ephox.sugar.api.node.Element',
    'ephox.sugar.api.selection.WindowSelection',
    'global!setTimeout',
    'global!window'
  ],

  function (Hierarchy, InsertAll, Remove, Body, Element, WindowSelection, setTimeout, window) {
    var p1 = Element.fromHtml('<p>This is the <strong>first</strong> paragraph</p>');
    var p2 = Element.fromHtml('<p>This is the <em>second</em> paragraph</p>');

    var p1text = Hierarchy.follow(p1, [ 0 ]).getOrDie('Looking for text in p1');
    var p2text = Hierarchy.follow(p2, [ 0 ]).getOrDie('Looking for text in p1');

    InsertAll.append(Body.body(), [ p1, p2 ]);
    var bounds = p1.dom().getBoundingClientRect();
    var x = bounds.left;
    var y = bounds.top + (bounds.height / 2);

    console.log('x', x, 'y', y);

    for (var i = x; i < bounds.right; i += 10) {
      var caret = WindowSelection.getAtPoint(window, i, y).getOrDie('Could not find selection');
      console.log('caret', caret.start().dom(), caret.soffset());
    }

    Remove.remove(p1);
    Remove.remove(p2);
  }
);
