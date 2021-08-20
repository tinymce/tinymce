import { Bounds, Boxes } from '@ephox/alloy';
import { after, before, context, describe, it } from '@ephox/bedrock-client';
import { InlineContent } from '@ephox/bridge';
import { Css, Scroll, SelectorFind, SugarBody, SugarElement } from '@ephox/sugar';
import { McEditor, TinyDom } from '@ephox/wrap-mcagar';
import { assert } from 'chai';

import Editor from 'tinymce/core/api/Editor';
import Theme from 'tinymce/themes/silver/Theme';
import { getContextToolbarBounds } from 'tinymce/themes/silver/ui/context/ContextToolbarBounds';

import TestBackstage from '../../../module/TestBackstage';
import * as UiUtils from '../../../module/UiUtils';

interface TestBounds {
  readonly header: Bounds;
  readonly container: Bounds;
  readonly content: Bounds;
  readonly viewport: Bounds;
}

interface Scenario {
  readonly settings: Record<string, any>;
  readonly position: InlineContent.ContextPosition;
  readonly scroll?: {
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
    Theme();
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
    const container = SugarElement.fromDom(editor.getContainer());
    const contentAreaContainer = SugarElement.fromDom(editor.getContentAreaContainer());
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
      ...scenario.settings
    });
    backstage.shared.header.setDockingMode(editor.settings.toolbar_location);
    editor.focus();
    await UiUtils.pWaitForEditorToRender();
    scrollRelativeEditorContainer(editor, scenario.scroll.relativeTop, scenario.scroll.delta);
    assertToolbarBounds(editor, scenario);
    McEditor.remove(editor);
  };

  context('Context toolbar bounds with toolbar top', () => {
    it('Inline(full view): bottom of the header -> Bottom of the viewport', pTestScenario({
      settings: { inline: true },
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
      settings: { menubar: false, inline: true, toolbar: false },
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
      settings: { },
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
      settings: { },
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
      settings: { },
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
      settings: { height: 400 },
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
      settings: { height: 400 },
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
      settings: { toolbar_location: 'bottom' },
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
      settings: { inline: true, toolbar_location: 'bottom' },
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
});
