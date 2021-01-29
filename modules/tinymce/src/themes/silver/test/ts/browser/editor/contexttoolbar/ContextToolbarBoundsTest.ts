import { Bounds, Boxes } from '@ephox/alloy';
import { after, before, context, describe, it } from '@ephox/bedrock-client';
import { McEditor, TinyDom } from '@ephox/mcagar';
import { Css, Scroll, SelectorFind, SugarBody, SugarElement } from '@ephox/sugar';
import { assert } from 'chai';

import Editor from 'tinymce/core/api/Editor';
import Theme from 'tinymce/themes/silver/Theme';
import { getContextToolbarBounds } from 'tinymce/themes/silver/ui/context/ContextToolbarBounds';

import TestBackstage from '../../../module/TestBackstage';

interface TestBounds {
  readonly header: Bounds;
  readonly container: Bounds;
  readonly content: Bounds;
  readonly viewport: Bounds;
}

interface Scenario {
  readonly label: string;
  readonly settings: Record<string, any>;
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
    const actual = getContextToolbarBounds(editor, backstage.shared);

    assertBounds('x');
    assertBounds('y');
    assertBounds('right');
    assertBounds('bottom');
  };

  const testScenario = (scenario: Scenario) => {
    it(scenario.label, async () => {
      const editor = await McEditor.pFromSettings<Editor>({
        base_url: '/project/tinymce/js/tinymce',
        ...scenario.settings
      });
      backstage.shared.header.setDockingMode(editor.settings.toolbar_location);
      editor.focus();
      scrollRelativeEditorContainer(editor, scenario.scroll.relativeTop, scenario.scroll.delta);
      assertToolbarBounds(editor, scenario);
      McEditor.remove(editor);
    });
  };

  context('Context toolbar bounds with toolbar top', () => {
    testScenario({
      label: 'Inline(full view): bottom of the header -> Bottom of the viewport',
      settings: { inline: true },
      scroll: { relativeTop: true, delta: -10 },
      assertBounds: (bounds) => ({
        x: bounds.content.x,
        y: bounds.header.bottom,
        right: bounds.content.right,
        bottom: bounds.viewport.bottom
      })
    });

    testScenario({
      label: 'Distraction Free(full view): Top of the viewport -> Bottom of the viewport',
      settings: { menubar: false, inline: true, toolbar: false },
      scroll: { relativeTop: true, delta: -10 },
      assertBounds: (bounds) => ({
        x: bounds.content.x,
        y: bounds.viewport.y,
        right: bounds.content.right,
        bottom: bounds.viewport.bottom
      })
    });

    testScenario({
      label: 'Iframe(full view): Bottom of the header -> Bottom of the editor container',
      settings: { },
      scroll: { relativeTop: true, delta: -10 },
      assertBounds: (bounds) => ({
        x: bounds.content.x,
        y: bounds.header.bottom,
        right: bounds.content.right,
        bottom: bounds.container.bottom
      })
    });

    testScenario({
      label: 'Iframe(editor partly in view): Top of viewport -> Bottom of the editor container',
      settings: { height: 400 },
      scroll: { relativeTop: true, delta: 200 },
      assertBounds: (bounds) => ({
        x: bounds.content.x,
        y: bounds.viewport.y,
        right: bounds.content.right,
        bottom: bounds.container.bottom
      })
    });

    testScenario({
      label: 'Iframe(editor partly in view): Bottom of viewport -> Top of content area',
      settings: { height: 400 },
      scroll: { relativeTop: false, delta: -200 },
      assertBounds: (bounds: TestBounds) => ({
        x: bounds.content.x,
        y: bounds.content.y,
        right: bounds.content.right,
        bottom: bounds.viewport.bottom
      })
    });
  });

  context('Context toolbar bounds with toolbar bottom', () => {
    testScenario({
      label: 'Iframe(full view): Bottom of the header -> Bottom of the editor container',
      settings: { toolbar_location: 'bottom' },
      scroll: { relativeTop: true, delta: -10 },
      assertBounds: (bounds: TestBounds) => ({
        x: bounds.content.x,
        y: bounds.container.y,
        right: bounds.content.right,
        bottom: bounds.header.y
      })
    });

    testScenario({
      label: 'Inline(full view): Top of the viewport -> Top of the header',
      settings: { inline: true, toolbar_location: 'bottom' },
      scroll: { relativeTop: true, delta: -10 },
      assertBounds: (bounds: TestBounds) => ({
        x: bounds.content.x,
        y: bounds.viewport.y,
        right: bounds.content.right,
        bottom: bounds.header.y
      })
    });
  });
});
