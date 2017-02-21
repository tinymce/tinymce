asynctest(
  'Browser Test: SelectionTest',

  [
    'ephox.katamari.api.Arr',
    'ephox.katamari.api.Obj',
    'ephox.sugar.api.dom.Compare',
    'ephox.sugar.api.dom.Hierarchy',
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

  function (
    Arr, Obj, Compare, Hierarchy, InsertAll, Body, Element, Node, Html, Selection, WindowSelection,
    setTimeout, window
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

    assertNoSelection('There should not be a selection yet');

    setSelection(p1text, 1, p2text, 1);
    assertSelection('(p1text, 1) -> (p2text, 2)', p1text, 1, p2text, 1);

    setSelection(p2text, 2, p1text, 3);
    assertSelection('(p2text, 2) -> (p1text, 3)', p2text, 2, p1text, 3);

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

    WindowSelection.getFirstRect(window, Selection.exact(p1, 0, p1, 1));

  }
);
