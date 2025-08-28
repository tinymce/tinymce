import { Assert, UnitTest } from '@ephox/bedrock-client';

import * as Compare from 'ephox/sugar/api/dom/Compare';
import * as Hierarchy from 'ephox/sugar/api/dom/Hierarchy';
import * as InsertAll from 'ephox/sugar/api/dom/InsertAll';
import * as Remove from 'ephox/sugar/api/dom/Remove';
import * as SugarBody from 'ephox/sugar/api/node/SugarBody';
import { SugarElement } from 'ephox/sugar/api/node/SugarElement';
import * as SugarElements from 'ephox/sugar/api/node/SugarElements';
import * as Html from 'ephox/sugar/api/properties/Html';
import * as Traverse from 'ephox/sugar/api/search/Traverse';
import { SimSelection } from 'ephox/sugar/api/selection/SimSelection';
import { Situ } from 'ephox/sugar/api/selection/Situ';
import * as WindowSelection from 'ephox/sugar/api/selection/WindowSelection';

UnitTest.test('Browser Test: SelectionTest', () => {
  const p1 = SugarElement.fromHtml<HTMLParagraphElement>('<p>This is the <strong>first</strong> paragraph</p>');
  const p2 = SugarElement.fromHtml<HTMLParagraphElement>('<p>This is the <em>second</em> paragraph</p>');

  const p1text = Hierarchy.follow(p1, [ 0 ]).getOrDie('Looking for text in p1');
  const p2text = Hierarchy.follow(p2, [ 0 ]).getOrDie('Looking for text in p1');

  InsertAll.append(SugarBody.body(), [ p1, p2 ]);

  const setSelection = (start: SugarElement<Node>, soffset: number, finish: SugarElement<Node>, foffset: number) => {
    WindowSelection.setExact(window, start, soffset, finish, foffset);
  };

  const assertNoSelection = (label: string) => {
    WindowSelection.getExact(window).each((_sel) => {
      Assert.fail('There should not be a selection yet: ' + label);
    });
  };

  const assertSelection = (label: string, expStart: SugarElement<Node>, expSoffset: number, expFinish: SugarElement<Node>, expFoffset: number) => {
    WindowSelection.getExact(window).fold(() => {
      Assert.fail('After setting selection ' + label + ', could not find a selection');
    }, (sel) => {
      Assert.eq(() => 'Start container should be: ' + Html.getOuter(expStart) + '\n' + label, true, Compare.eq(sel.start, expStart));
      Assert.eq('', expSoffset, sel.soffset);
      Assert.eq(() => 'Finish container should be ' + Html.getOuter(expFinish) + '\n' + label, true, Compare.eq(sel.finish, expFinish));
      Assert.eq('', expFoffset, sel.foffset);
    });
  };

  WindowSelection.clear(window);
  assertNoSelection('There should not be a selection yet');

  setSelection(p1text, 1, p2text, 1);
  assertSelection('(p1text, 1) -> (p2text, 2)', p1text, 1, p2text, 1);

  setSelection(p2text, 2, p1text, 3);
  assertSelection('(p2text, 2) -> (p1text, 3)', p2text, 2, p1text, 3);

  const assertFragmentHtml = (expected: string, fragment: SugarElement<Node>) => {
    const div = SugarElement.fromTag('div');
    InsertAll.append(div, Traverse.children(fragment));
    Assert.eq('', expected, Html.get(div));
  };

  const p1Selected = WindowSelection.forElement(window, p1);
  const clone = WindowSelection.clone(window, SimSelection.exactFromRange(p1Selected));
  assertFragmentHtml('This is the <strong>first</strong> paragraph', clone);

  WindowSelection.replace(window, SimSelection.exactFromRange(p1Selected), SugarElements.fromHtml('<a>link</a><span>word</span>'));
  Assert.eq('', '<a>link</a><span>word</span>', Html.get(p1));

  WindowSelection.deleteAt(window,
    SimSelection.exact(
      Hierarchy.follow(p1, [ 0, 0 ]).getOrDie('looking for text in a'),
      'li'.length,
      Hierarchy.follow(p1, [ 1, 0 ]).getOrDie('looking for text in span'),
      'wor'.length
    )
  );

  Assert.eq('', '<a>li</a><span>d</span>', Html.get(p1));

  Remove.remove(p1);
  Remove.remove(p2);

  const assertRng = (selection: SimSelection, expStart: SugarElement<Node>, expSoffset: number, expFinish: SugarElement<Node>, expFoffset: number) => {
    const r = WindowSelection.toNative(selection);

    Assert.eq(() => 'Start Container should be: ' + Html.getOuter(expStart), expStart.dom, r.startContainer);
    Assert.eq('Start offset should be: ' + expSoffset, expSoffset, r.startOffset);
    Assert.eq(() => 'End Container should be: ' + Html.getOuter(expFinish), expFinish.dom, r.endContainer);
    Assert.eq('End offset should be: ' + expFoffset, expFoffset, r.endOffset);

    return r;
  };

  const exact = SimSelection.exact(p1text, 1, p2text, 1);
  assertRng(exact, p1text, 1, p2text, 1);

  const startSitu = Situ.on(p1text, 1);
  const finishSitu = Situ.on(p2text, 1);
  const relative = SimSelection.relative(startSitu, finishSitu);

  const rng = assertRng(relative, p1text, 1, p2text, 1);

  const domRng = SimSelection.domRange(rng);

  assertRng(domRng, p1text, 1, p2text, 1);
});
