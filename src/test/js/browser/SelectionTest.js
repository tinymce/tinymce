import { PlatformDetection } from '@ephox/sand';
import Compare from 'ephox/sugar/api/dom/Compare';
import Hierarchy from 'ephox/sugar/api/dom/Hierarchy';
import InsertAll from 'ephox/sugar/api/dom/InsertAll';
import Remove from 'ephox/sugar/api/dom/Remove';
import Body from 'ephox/sugar/api/node/Body';
import Element from 'ephox/sugar/api/node/Element';
import Elements from 'ephox/sugar/api/node/Elements';
import Html from 'ephox/sugar/api/properties/Html';
import Traverse from 'ephox/sugar/api/search/Traverse';
import Selection from 'ephox/sugar/api/selection/Selection';
import Situ from 'ephox/sugar/api/selection/Situ';
import WindowSelection from 'ephox/sugar/api/selection/WindowSelection';
import { UnitTest, assert } from '@ephox/refute';

UnitTest.test('Browser Test: SelectionTest', function() {
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

  WindowSelection.clear(window);
  assertNoSelection('There should not be a selection yet');

  setSelection(p1text, 1, p2text, 1);
  assertSelection('(p1text, 1) -> (p2text, 2)', p1text, 1, p2text, 1);

  setSelection(p2text, 2, p1text, 3);
  if (! PlatformDetection.detect().browser.isIE()) assertSelection('(p2text, 2) -> (p1text, 3)', p2text, 2, p1text, 3);
  else assertSelection('reversed (p1text, 3) -> (p2text, 2)', p1text, 3, p2text, 2);


  var assertFragmentHtml = function (expected, fragment) {
    var div = Element.fromTag('div');
    InsertAll.append(div, Traverse.children(fragment));
    assert.eq(expected, Html.get(div));
  };

  var p1Selected = WindowSelection.forElement(window, p1);
  var clone = WindowSelection.clone(window, Selection.exactFromRange(p1Selected));
  assertFragmentHtml('This is the <strong>first</strong> paragraph', clone);

  WindowSelection.replace(window, Selection.exactFromRange(p1Selected), Elements.fromHtml('<a>link</a><span>word</span>'));
  assert.eq('<a>link</a><span>word</span>', Html.get(p1));

  WindowSelection.deleteAt(window,
    Selection.exact(
      Hierarchy.follow(p1, [ 0, 0 ]).getOrDie('looking for text in a'),
      'li'.length,
      Hierarchy.follow(p1, [ 1, 0 ]).getOrDie('looking for text in span'),
      'wor'.length
    )
  );

  assert.eq('<a>li</a><span>d</span>', Html.get(p1));

  Remove.remove(p1);
  Remove.remove(p2);

  var assertRng = function (selection, expStart, expSoffset, expFinish, expFoffset) {
    var rng = WindowSelection.toNative(selection);

    assert.eq(expStart.dom(), rng.startContainer, 'Start Container should be: ' + Html.getOuter(expStart));
    assert.eq(expSoffset, rng.startOffset, 'Start offset should be: ' + expSoffset);
    assert.eq(expFinish.dom(), rng.endContainer, 'End Container should be: ' + Html.getOuter(expFinish));
    assert.eq(expFoffset, rng.endOffset, 'End offset should be: ' + expFoffset);

    return rng;
  };

  var exact = Selection.exact(p1text, 1, p2text, 1);
  assertRng(exact, p1text, 1, p2text, 1);

  var startSitu = Situ.on(p1text, 1);
  var finishSitu = Situ.on(p2text, 1);
  var relative = Selection.relative(startSitu, finishSitu);

  var rng = assertRng(relative, p1text, 1, p2text, 1);

  var domRng = Selection.domRange(rng);

  assertRng(domRng, p1text, 1, p2text, 1);
});

