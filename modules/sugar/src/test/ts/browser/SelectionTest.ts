import { assert, UnitTest } from '@ephox/bedrock-client';
import { HTMLParagraphElement, Node as DomNode, window } from '@ephox/dom-globals';
import { PlatformDetection } from '@ephox/sand';
import * as Compare from 'ephox/sugar/api/dom/Compare';
import * as Hierarchy from 'ephox/sugar/api/dom/Hierarchy';
import * as InsertAll from 'ephox/sugar/api/dom/InsertAll';
import * as Remove from 'ephox/sugar/api/dom/Remove';
import * as Body from 'ephox/sugar/api/node/Body';
import Element from 'ephox/sugar/api/node/Element';
import * as Elements from 'ephox/sugar/api/node/Elements';
import * as Html from 'ephox/sugar/api/properties/Html';
import * as Traverse from 'ephox/sugar/api/search/Traverse';
import { Selection } from 'ephox/sugar/api/selection/Selection';
import { Situ } from 'ephox/sugar/api/selection/Situ';
import * as WindowSelection from 'ephox/sugar/api/selection/WindowSelection';

UnitTest.test('Browser Test: SelectionTest', () => {
  const p1 = Element.fromHtml<HTMLParagraphElement>('<p>This is the <strong>first</strong> paragraph</p>');
  const p2 = Element.fromHtml<HTMLParagraphElement>('<p>This is the <em>second</em> paragraph</p>');

  const p1text = Hierarchy.follow(p1, [ 0 ]).getOrDie('Looking for text in p1');
  const p2text = Hierarchy.follow(p2, [ 0 ]).getOrDie('Looking for text in p1');

  InsertAll.append(Body.body(), [ p1, p2 ]);

  const setSelection = (start: Element<DomNode>, soffset: number, finish: Element<DomNode>, foffset: number) => {
    WindowSelection.setExact(window, start, soffset, finish, foffset);
  };

  const assertNoSelection = (label: string) => {
    WindowSelection.getExact(window).each((_sel) => {
      assert.fail('There should not be a selection yet: ' + label);
    });
  };

  const assertSelection = (label: string, expStart: Element<DomNode>, expSoffset: number, expFinish: Element<DomNode>, expFoffset: number) => {
    WindowSelection.getExact(window).fold(() => {
      assert.fail('After setting selection ' + label + ', could not find a selection');
    }, (sel) => {
      assert.eq(true, Compare.eq(sel.start(), expStart), () => 'Start container should be: ' + Html.getOuter(expStart) + '\n' + label);
      assert.eq(expSoffset, sel.soffset());
      assert.eq(true, Compare.eq(sel.finish(), expFinish), () => 'Finish container should be ' + Html.getOuter(expFinish) + '\n' + label);
      assert.eq(expFoffset, sel.foffset());
    });
  };

  WindowSelection.clear(window);
  assertNoSelection('There should not be a selection yet');

  setSelection(p1text, 1, p2text, 1);
  assertSelection('(p1text, 1) -> (p2text, 2)', p1text, 1, p2text, 1);

  setSelection(p2text, 2, p1text, 3);
  if (! PlatformDetection.detect().browser.isIE()) { assertSelection('(p2text, 2) -> (p1text, 3)', p2text, 2, p1text, 3); } else { assertSelection('reversed (p1text, 3) -> (p2text, 2)', p1text, 3, p2text, 2); }

  const assertFragmentHtml = (expected: string, fragment: Element<DomNode>) => {
    const div = Element.fromTag('div');
    InsertAll.append(div, Traverse.children(fragment));
    assert.eq(expected, Html.get(div));
  };

  const p1Selected = WindowSelection.forElement(window, p1);
  const clone = WindowSelection.clone(window, Selection.exactFromRange(p1Selected));
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

  const assertRng = (selection: Selection, expStart: Element<DomNode>, expSoffset: number, expFinish: Element<DomNode>, expFoffset: number) => {
    const r = WindowSelection.toNative(selection);

    assert.eq(expStart.dom(), r.startContainer, () => 'Start Container should be: ' + Html.getOuter(expStart));
    assert.eq(expSoffset, r.startOffset, 'Start offset should be: ' + expSoffset);
    assert.eq(expFinish.dom(), r.endContainer, () => 'End Container should be: ' + Html.getOuter(expFinish));
    assert.eq(expFoffset, r.endOffset, 'End offset should be: ' + expFoffset);

    return r;
  };

  const exact = Selection.exact(p1text, 1, p2text, 1);
  assertRng(exact, p1text, 1, p2text, 1);

  const startSitu = Situ.on(p1text, 1);
  const finishSitu = Situ.on(p2text, 1);
  const relative = Selection.relative(startSitu, finishSitu);

  const rng = assertRng(relative, p1text, 1, p2text, 1);

  const domRng = Selection.domRange(rng);

  assertRng(domRng, p1text, 1, p2text, 1);
});
