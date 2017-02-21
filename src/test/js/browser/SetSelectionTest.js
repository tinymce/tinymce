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
    'ephox.sugar.api.properties.Html',
    'ephox.sugar.api.selection.WindowSelection',
    'global!setTimeout',
    'global!window'
  ],

  function (
    Compare, Hierarchy, InsertAll, Body, Element, Node, Text, Html, WindowSelection, setTimeout,
    window
  ) {
    var success = arguments[arguments.length - 2];
    var failure = arguments[arguments.length - 1];

    var p1 = Element.fromHtml('<p>This is the first paragraph</p>');
    var p2 = Element.fromHtml('<p>This is the second paragraph</p>');

    var p1text = Hierarchy.follow(p1, [ 0 ]).getOrDie('Looking for text in p1');
    var p2text = Hierarchy.follow(p2, [ 0 ]).getOrDie('Looking for text in p1');

    InsertAll.append(Body.body(), [ p1, p2 ]);

    var setSelection = function (start, soffset, finish, foffset) {
      WindowSelection.set(window, start, soffset, finish, foffset);
    };

    var assertNoSelection = function (label) {
      WindowSelection.get(window).each(function (sel) {
        assert.fail('There should not be a selection yet: ' + label);
      });
    };

    var assertSelection = function (label, expStart, expSoffset, expFinish, expFoffset) {
      WindowSelection.get(window).fold(function () {
        assert.fail('After setting selection ' + label + ', could not find a selection');
      }, function (sel) {
        assert.eq(true, Compare.eq(sel.start(), p1text), 'Start container should be: ' + Html.getOuter(expStart) + '\n' + label)
        assert.eq(expSoffset, sel.soffset());
        assert.eq(true, Compare.eq(sel.finish(), p2text), 'Finish container should be ' + Html.getOuter(expFinish) + '\n' + label);
        assert.eq(expFoffset, sel.foffset());
      });
    };

    assertNoSelection('There should not be a selection yet');

    setSelection(p1text, 1, p2text, 1);
    assertSelection('(p1text, 1) -> (p2text, 2)', p1text, 1, p2text, 1);

    setTimeout(function () {
      setSelection(p2text, 2, p1text, 3);
      assertSelection('(p2text, 2) -> (p1text, 3)', p2text, 2, p1text, 3);
    }, 2000);
  }
);
