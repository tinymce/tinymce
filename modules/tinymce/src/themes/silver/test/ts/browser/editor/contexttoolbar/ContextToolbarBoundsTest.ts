import { Bounds, Boxes } from '@ephox/alloy';
import { after, before, context, describe, it } from '@ephox/bedrock-client';
import { InlineContent } from '@ephox/bridge';
import { Css, Scroll, SelectorFind, SugarBody } from '@ephox/sugar';
import { McEditor, TinyDom } from '@ephox/wrap-mcagar';
import { assert } from 'chai';

import Editor from 'tinymce/core/api/Editor';
import { RawEditorOptions } from 'tinymce/core/api/OptionTypes';
import { getContextToolbarBounds, isVerticalOverlap } from 'tinymce/themes/silver/ui/context/ContextToolbarBounds';

import TestBackstage from '../../../module/TestBackstage';
import * as UiUtils from '../../../module/UiUtils';

interface TestBounds {
  readonly header: Bounds;
  readonly container: Bounds;
  readonly content: Bounds;
  readonly viewport: Bounds;
}

interface Scenario {
  readonly options: RawEditorOptions;
  readonly position: InlineContent.ContextPosition;
  readonly scroll: {
    readonly relativeTop: boolean;
    readonly delta: number;
  };
  readonly assertBounds: (currentBounds: TestBounds) => {
    readonly x: number;
    readonly y: number;
    readonly right: number;
    readonly bottom: number;
  };
}

describe('browser.tinymce.themes.silver.editor.contexttoolbar.ContextToolbarBoundsTest', () => {
  const backstage = TestBackstage();
  const expectedMargin = 1;

  before(() => {
    const body = SugarBody.body();
    Css.set(body, 'margin-left', '10px');
    Css.set(body, 'margin-right', '10px');
    Css.set(body, 'margin-top', '3000px');
    Css.set(body, 'margin-bottom', '3000px');
  });

  after(() => {
    const body = SugarBody.body();
    Css.remove(body, 'margin-left');
    Css.remove(body, 'margin-right');
    Css.remove(body, 'margin-top');
    Css.remove(body, 'margin-bottom');
  });

  const getBounds = (editor: Editor): TestBounds => {
    const container = TinyDom.container(editor);
    const contentAreaContainer = TinyDom.contentAreaContainer(editor);
    const header = SelectorFind.descendant<HTMLElement>(SugarBody.body(), '.tox-editor-header').getOrDie();

    return {
      viewport: Boxes.win(),
      header: Boxes.box(header),
      container: Boxes.box(container),
      content: Boxes.box(contentAreaContainer)
    };
  };

  const scrollRelativeEditorContainer = (editor: Editor, relativeTop: boolean, delta: number) => {
    const editorContainer = TinyDom.container(editor);
    editorContainer.dom.scrollIntoView(relativeTop);
    Scroll.to(0, window.pageYOffset + delta);
  };

  const assertToolbarBounds = (editor: Editor, scenario: Scenario) => {
    const assertBounds = (bound: 'x' | 'y' | 'right' | 'bottom') => {
      const expectedBound = asserted[bound];
      const actualBound = actual[bound];

      assert.equal(actualBound, expectedBound, `Expect context toolbar bounds.${bound} === ${expectedBound} (Actual: ${actualBound})`);
    };

    const asserted = scenario.assertBounds(getBounds(editor));
    const actual = getContextToolbarBounds(editor, backstage.shared, scenario.position, expectedMargin);

    assertBounds('x');
    assertBounds('y');
    assertBounds('right');
    assertBounds('bottom');
  };

  const pTestScenario = (scenario: Scenario) => async () => {
    const editor = await McEditor.pFromSettings<Editor>({
      base_url: '/project/tinymce/js/tinymce',
      ...scenario.options
    });
    const toolbarLocation = editor.options.get('toolbar_location') === 'bottom' ? 'bottom' : 'top';
    backstage.shared.header.setDockingMode(toolbarLocation);
    editor.focus();
    await UiUtils.pWaitForEditorToRender();
    scrollRelativeEditorContainer(editor, scenario.scroll.relativeTop, scenario.scroll.delta);
    assertToolbarBounds(editor, scenario);
    McEditor.remove(editor);
  };

  context('Context toolbar bounds with toolbar top', () => {
    it('Inline(full view): bottom of the header -> Bottom of the viewport', pTestScenario({
      options: { inline: true },
      position: 'selection',
      scroll: { relativeTop: true, delta: -10 },
      assertBounds: (bounds) => ({
        x: bounds.content.x + expectedMargin,
        y: bounds.header.bottom + expectedMargin,
        right: bounds.content.right - expectedMargin,
        bottom: bounds.viewport.bottom
      })
    }));

    it('Distraction Free(full view): Top of the viewport -> Bottom of the viewport', pTestScenario({
      options: { menubar: false, inline: true, toolbar: false },
      position: 'selection',
      scroll: { relativeTop: true, delta: -10 },
      assertBounds: (bounds) => ({
        x: bounds.content.x + expectedMargin,
        y: bounds.viewport.y,
        right: bounds.content.right - expectedMargin,
        bottom: bounds.viewport.bottom
      })
    }));

    it('Iframe(full view) selection toolbar: Bottom of the header -> Bottom of the content area', pTestScenario({
      options: { },
      position: 'selection',
      scroll: { relativeTop: true, delta: -10 },
      assertBounds: (bounds) => ({
        x: bounds.content.x + expectedMargin,
        y: bounds.header.bottom + expectedMargin,
        right: bounds.content.right - expectedMargin,
        bottom: bounds.content.bottom - expectedMargin
      })
    }));

    it('Iframe(full view) node toolbar: Bottom of the header -> Bottom of the content area', pTestScenario({
      options: { },
      position: 'node',
      scroll: { relativeTop: true, delta: -10 },
      assertBounds: (bounds) => ({
        x: bounds.content.x + expectedMargin,
        y: bounds.header.bottom + expectedMargin,
        right: bounds.content.right - expectedMargin,
        bottom: bounds.content.bottom - expectedMargin
      })
    }));

    it('Iframe(full view) line toolbar: Bottom of the header -> Bottom of the editor container', pTestScenario({
      options: { },
      position: 'line',
      scroll: { relativeTop: true, delta: -10 },
      assertBounds: (bounds) => ({
        x: bounds.content.x + expectedMargin,
        y: bounds.header.bottom + expectedMargin,
        right: bounds.content.right - expectedMargin,
        bottom: bounds.container.bottom - expectedMargin
      })
    }));

    it('Iframe(editor partly in view): Top of viewport -> Bottom of the content area', pTestScenario({
      options: { height: 400 },
      position: 'selection',
      scroll: { relativeTop: true, delta: 200 },
      assertBounds: (bounds) => ({
        x: bounds.content.x + expectedMargin,
        y: bounds.viewport.y,
        right: bounds.content.right - expectedMargin,
        bottom: bounds.content.bottom - expectedMargin
      })
    }));

    it('Iframe(editor partly in view): Bottom of viewport -> Top of the content area', pTestScenario({
      options: { height: 400 },
      position: 'selection',
      scroll: { relativeTop: false, delta: -200 },
      assertBounds: (bounds: TestBounds) => ({
        x: bounds.content.x + expectedMargin,
        y: bounds.content.y + expectedMargin,
        right: bounds.content.right - expectedMargin,
        bottom: bounds.viewport.bottom
      })
    }));
  });

  context('Context toolbar bounds with toolbar bottom', () => {
    it('Iframe(full view): Top of the content area -> Top of the header', pTestScenario({
      options: { toolbar_location: 'bottom' },
      position: 'node',
      scroll: { relativeTop: true, delta: -10 },
      assertBounds: (bounds: TestBounds) => ({
        x: bounds.content.x + expectedMargin,
        y: bounds.content.y + expectedMargin,
        right: bounds.content.right - expectedMargin,
        bottom: bounds.header.y - expectedMargin
      })
    }));

    it('Inline(full view): Top of the viewport -> Top of the header', pTestScenario({
      options: { inline: true, toolbar_location: 'bottom' },
      position: 'selection',
      scroll: { relativeTop: true, delta: -10 },
      assertBounds: (bounds: TestBounds) => ({
        x: bounds.content.x + expectedMargin,
        y: bounds.viewport.y,
        right: bounds.content.right - expectedMargin,
        bottom: bounds.header.y - expectedMargin
      })
    }));
  });

  context('isVerticalOverlap', () => {
    const bY = 200;
    const bBottom = 300;

    // The threshold values are intentionally negative numbers, because the
    // function is measuring overlap, so a negative value is not overlap. Using higher
    // negative numbers for the threshold increases the chance of overlap.
    const threshold = -10;
    // We use a value of 5 instead of 10 to give us a bit of room to play with for
    // before/after y values.
    const withinThreshold = -5;

    const beforeBOutsideThreshold = bY - 50;
    const beforeBBWithinThreshold = bY + withinThreshold;

    const midB = (bY + bBottom) / 2;

    const afterBWithinThreshold = bBottom + Math.abs(withinThreshold);
    const afterBOutsideThreshold = bBottom + 50;

    const testAValue = (expected: boolean, aY: number, aBottom: number) => {
      const a: any = { bottom: aBottom, y: aY };
      const b: any = { bottom: bBottom, y: bY };

      const actual = isVerticalOverlap(a, b, threshold);
      assert.equal(actual, expected);
    };

    context('a starts above b and outside threshold', () => {
      const aY = beforeBOutsideThreshold - 50;

      it('a finishes before b, and outside threshold', () => {
        testAValue(false, aY, beforeBOutsideThreshold);
      });

      it('a finishes before b, but within threshold', () => {
        testAValue(true, aY, beforeBBWithinThreshold);
      });

      it('a finishes within b', () => {
        testAValue(true, aY, midB);
      });

      it('a finishes after b, but within threshold', () => {
        testAValue(true, aY, afterBWithinThreshold);
      });

      it('a finishes after b, and outside threshold', () => {
        testAValue(true, aY, afterBOutsideThreshold);
      });
    });

    context('a starts above b and inside threshold', () => {
      // Because the within threshold is smaller than the threshold, this should
      // still be within the threshold of bY
      const aY = beforeBBWithinThreshold - 1;

      it('a finishes before b, but within threshold', () => {
        testAValue(true, aY, beforeBBWithinThreshold);
      });

      it('a finishes within b', () => {
        testAValue(true, aY, midB);
      });

      it('a finishes after b, but within threshold', () => {
        testAValue(true, aY, afterBWithinThreshold);
      });

      it('a finishes after b, and outside threshold', () => {
        testAValue(true, aY, afterBOutsideThreshold);
      });
    });

    context('a starts within b', () => {
      const aY = midB;

      it('a finishes within b', () => {
        testAValue(true, aY, midB + 10);
      });

      it('a finishes after b, but within threshold', () => {
        testAValue(true, aY, afterBWithinThreshold);
      });

      it('a finishes after b, but outside threshold', () => {
        testAValue(true, aY, afterBOutsideThreshold);
      });
    });

    context('a starts after b, but within threshold', () => {
      // This value should be before afterBWithinThreshold, but after bBottom
      const aY = bBottom + 1;

      it('a finishes after b, but within threshold', () => {
        testAValue(true, aY, afterBWithinThreshold);
      });

      it('a finishes after b, but outside threshold', () => {
        testAValue(true, aY, afterBOutsideThreshold);
      });
    });

    context('a starts after b, but outside threshold', () => {
      // This value should be before afterBWithinThreshold, but after bBottom
      const aY = afterBOutsideThreshold;

      it('a finishes after b, but outside threshold', () => {
        testAValue(false, aY, afterBOutsideThreshold + 50);
      });
    });
  });
});
