test(
  'Browser Test: SelectionTest',

  [
    'ephox.katamari.api.Arr',
    'ephox.katamari.api.Obj',
    'ephox.sand.api.PlatformDetection',
    'ephox.sugar.api.dom.Compare',
    'ephox.sugar.api.dom.Hierarchy',
    'ephox.sugar.api.dom.InsertAll',
    'ephox.sugar.api.dom.Remove',
    'ephox.sugar.api.node.Body',
    'ephox.sugar.api.node.Element',
    'ephox.sugar.api.node.Node',
    'ephox.sugar.api.properties.Html',
    'ephox.sugar.api.selection.Selection',
    'ephox.sugar.api.selection.WindowSelection',
    'global!setTimeout',
    'global!window'
  ],

  function (
    Arr, Obj, PlatformDetection, Compare, Hierarchy, InsertAll, Remove, Body, Element,
    Node, Html, Selection, WindowSelection, setTimeout, window
  ) {
    var success = arguments[arguments.length - 2];
    var failure = arguments[arguments.length - 1];

    var p1 = Element.fromHtml('<p>This is the <strong>first</strong> paragraph</p>');
    var p2 = Element.fromHtml('<p>This is the <em>second</em> paragraph</p>');

    var p1text = Hierarchy.follow(p1, [ 0 ]).getOrDie('Looking for text in p1');
    var p2text = Hierarchy.follow(p2, [ 0 ]).getOrDie('Looking for text in p1');

    InsertAll.append(Body.body(), [ p1, p2 ]);

    var setSelection = function (start, soffset, finish, foffset) {
      WindowSelection.setExact(window, start, soffset, finish, foffset);
    };

    var assertNoSelection = function (label) {
      WindowSelection.getExact(window).each(function (sel) {
        assert.fail('There should not be a selection yet: ' + label);
      });
    };

    var assertSelection = function (label, expStart, expSoffset, expFinish, expFoffset) {
      WindowSelection.getExact(window).fold(function () {
        assert.fail('After setting selection ' + label + ', could not find a selection');
      }, function (sel) {
        assert.eq(true, Compare.eq(sel.start(), expStart), 'Start container should be: ' + Html.getOuter(expStart) + '\n' + label)
        assert.eq(expSoffset, sel.soffset());
        assert.eq(true, Compare.eq(sel.finish(), expFinish), 'Finish container should be ' + Html.getOuter(expFinish) + '\n' + label);
        assert.eq(expFoffset, sel.foffset());
      });
    };

    WindowSelection.clearSelection(window);
    assertNoSelection('There should not be a selection yet');

    setSelection(p1text, 1, p2text, 1);
    assertSelection('(p1text, 1) -> (p2text, 2)', p1text, 1, p2text, 1);

    setSelection(p2text, 2, p1text, 3);
    if (! PlatformDetection.detect().browser.isIE()) assertSelection('(p2text, 2) -> (p1text, 3)', p2text, 2, p1text, 3);
    else assertSelection('reversed (p1text, 3) -> (p2text, 2)', p1text, 3, p2text, 2);

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

    var selP1 = Selection.exact(p1, 0, p1, 1);
    var selP2 = Selection.exact(p2, 0, p2, 1);

    var rect1 = WindowSelection.getFirstRect(window, selP1).getOrDie(
      'There should be a rectangle for paragraph 1'
    );

    var rect2 = WindowSelection.getFirstRect(window, selP2).getOrDie(
      'There should be a rectangle for paragraph 2'
    );

    assert.eq(
      true, rect1.top() < rect2.top(), 'Rect 1 should be above Rect 2. (1) was ' +
      rect1.top() + ', and (2) was ' + rect2.top()
    );

    var bounds1 = WindowSelection.getBounds(window, selP1).getOrDie(
      'There should be bounds for paragraph 1'
    );
    var bounds2 = WindowSelection.getBounds(window, selP2).getOrDie(
      'There should be bounds for paragraph 2'
    );
    assert.eq(
      true,
      bounds1.top() < bounds2.top(),
      'Bounds 1 should be above bound 2. (1) was ' + bounds1.top() + ', and (2)' +
      ' was ' + bounds2.top()
    );

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
