import { assert, UnitTest } from '@ephox/bedrock';
import { window } from '@ephox/dom-globals';
import { Arr, Obj } from '@ephox/katamari';
import * as InsertAll from 'ephox/sugar/api/dom/InsertAll';
import * as Remove from 'ephox/sugar/api/dom/Remove';
import * as Body from 'ephox/sugar/api/node/Body';
import Element from 'ephox/sugar/api/node/Element';
import * as Node from 'ephox/sugar/api/node/Node';
import * as Html from 'ephox/sugar/api/properties/Html';
import { Selection } from 'ephox/sugar/api/selection/Selection';
import * as WindowSelection from 'ephox/sugar/api/selection/WindowSelection';

UnitTest.test('Browser Test: SelectionTest', function () {
  const p1 = Element.fromHtml('<p>This is the <strong>first</strong> paragraph</p>');
  const p2 = Element.fromHtml('<p>This is the <em>second</em> paragraph</p>');

  InsertAll.append(Body.body(), [ p1, p2 ]);

  const assertWithin = function (expected, outer) {
    WindowSelection.setToElement(window, outer);
    WindowSelection.getExact(window).fold(function () {
      assert.fail('Selection should be wrapping: ' + Html.getOuter(outer));
    }, function (sel) {
      Obj.each(expected, function (num, tag) {
        const actual = WindowSelection.findWithin(
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

  Remove.remove(p1);
  Remove.remove(p2);
});
