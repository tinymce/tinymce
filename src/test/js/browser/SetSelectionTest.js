asynctest(
  'Browser Test: SetSelectionTest',

  [
    'ephox.sugar.api.dom.Compare',
    'ephox.sugar.api.dom.Hierarchy',
    'ephox.sugar.api.dom.InsertAll',
    'ephox.sugar.api.node.Body',
    'ephox.sugar.api.node.Element',
    'ephox.sugar.api.node.Node',
    'ephox.sugar.api.node.Text',
    'ephox.sugar.api.selection.WindowSelection',
    'global!setTimeout',
    'global!window'
  ],

  function (
    Compare, Hierarchy, InsertAll, Body, Element, Node, Text, WindowSelection, setTimeout,
    window
  ) {
    var success = arguments[arguments.length - 2];
    var failure = arguments[arguments.length - 1];

    var p1 = Element.fromHtml('<p>This is the first paragraph</p>');
    var p2 = Element.fromHtml('<p>This is the second paragraph</p>');

    var p1text = Hierarchy.follow(p1, [ 0 ]).getOrDie('Looking for text in p1');
    var p2text = Hierarchy.follow(p2, [ 0 ]).getOrDie('Looking for text in p1');

    InsertAll.append(Body.body(), [ p1, p2 ]);

    WindowSelection.get(window).fold(function () {

    }, function (sel) {
      assert.fail('There should not be a selection yet');
    });

    WindowSelection.set(window, p1text, 1, p2text, 1);

    // Check that the selection is the text nodes
    WindowSelection.get(window).fold(function () {
      assert.fail('After setting selection (p1, p2), could not find a selection');
    }, function (sel) {
      assert.eq(true, Compare.eq(sel.start(), p1text), 'Start container should be p1text');
      assert.eq(true, Compare.eq(sel.finish(), p2text), 'Finish container should be p2text');
    });

    setTimeout(function () {
      WindowSelection.set(window, p2text, 2, p1text, 2);
    }, 2000);


  }
);
