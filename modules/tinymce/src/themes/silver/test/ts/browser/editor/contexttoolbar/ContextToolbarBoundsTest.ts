import { Assertions, Chain, GeneralSteps, Logger, NamedChain, Pipeline } from '@ephox/agar';
import { Bounds, Boxes } from '@ephox/alloy';
import { UnitTest } from '@ephox/bedrock-client';
import { Fun } from '@ephox/katamari';
import { Editor as McEditor } from '@ephox/mcagar';
import { Css, Scroll, SelectorFind, SugarBody, SugarElement } from '@ephox/sugar';
import Editor from 'tinymce/core/api/Editor';
import SilverTheme from 'tinymce/themes/silver/Theme';
import { getContextToolbarBounds } from 'tinymce/themes/silver/ui/context/ContextToolbarBounds';
import TestBackstage from '../../../module/TestBackstage';

UnitTest.asynctest('ContextToolbarBoundsTest', (success, failure) => {
  SilverTheme();
  const backstage = TestBackstage();

  interface TestBounds {
    header: Bounds;
    container: Bounds;
    content: Bounds;
    viewport: Bounds;
  }

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

  const setupPageScroll = () => {
    const body = SugarBody.body();

    Css.set(body, 'margin-left', '10px');
    Css.set(body, 'margin-right', '10px');
    Css.set(body, 'margin-top', '3000px');
    Css.set(body, 'margin-bottom', '3000px');

    return () => {
      Css.remove(body, 'margin-left');
      Css.remove(body, 'margin-right');
      Css.remove(body, 'margin-top');
      Css.remove(body, 'margin-bottom');
    };
  };

  const cScrollRelativeEditorContainer = (relativeTop: boolean, delta: number) => Chain.op((editor: Editor) => {
    const editorContainer = SugarElement.fromDom(editor.getContainer());
    editorContainer.dom.scrollIntoView(relativeTop);
    Scroll.to(0, window.pageYOffset + delta);
  });

  interface Scenario {
    label: string;
    settings: Record<string, any>;
    scroll?: {
      relativeTop: boolean;
      delta: number;
    };
    assertBounds: (currentBounds: TestBounds) => {
      x: number;
      y: number;
      right: number;
      bottom: number;
    };
  }

  const sTestScenario = (scenario: Scenario) => Logger.t(scenario.label, Chain.asStep({ }, [
    NamedChain.asChain([
      NamedChain.write('editor', McEditor.cFromSettings({
        theme: 'silver',
        base_url: '/project/tinymce/js/tinymce',
        ...scenario.settings
      })),
      NamedChain.read('editor', Chain.op((editor) => backstage.shared.header.setDockingMode(editor.settings.toolbar_location))),
      NamedChain.write('tearDownScroll', Chain.mapper(() => setupPageScroll())),
      NamedChain.read('editor', Chain.op((editor: Editor) => editor.focus())),
      NamedChain.read('editor', cScrollRelativeEditorContainer(scenario.scroll.relativeTop, scenario.scroll.delta)),
      NamedChain.read('editor', Chain.op((editor) => {
        const assertBounds = (bound: 'x' | 'y' | 'right' | 'bottom') => {
          const expectedBound = asserted[bound];
          const actualBound = actual[bound];

          Assertions.assertEq(
            `Expect context toolbar bounds.${bound} === ${expectedBound} (Actual: ${actualBound})`,
            actualBound,
            expectedBound
          );
        };

        const asserted = scenario.assertBounds(getBounds(editor));
        const actual = getContextToolbarBounds(editor, backstage.shared);

        assertBounds('x');
        assertBounds('y');
        assertBounds('right');
        assertBounds('bottom');
      })),
      NamedChain.read('tearDownScroll', Chain.op(Fun.call)),
      NamedChain.read('editor', McEditor.cRemove)
    ])
  ]));

  Pipeline.async({}, [
    Logger.t('Test Context toolbar bounds with toolbar top', GeneralSteps.sequence([
      sTestScenario({
        label: 'Inline(full view): bottom of the header -> Bottom of the viewport',
        settings: { inline: true },
        scroll: { relativeTop: true, delta: -10 },
        assertBounds: (bounds: TestBounds) => ({
          x: bounds.content.x,
          y: bounds.header.bottom,
          right: bounds.content.right,
          bottom: bounds.viewport.bottom
        })
      }),
      sTestScenario({
        label: 'Distraction Free(full view): Top of the viewport -> Bottom of the viewport',
        settings: { menubar: false, inline: true, toolbar: false },
        scroll: { relativeTop: true, delta: -10 },
        assertBounds: (bounds: TestBounds) => ({
          x: bounds.content.x,
          y: bounds.viewport.y,
          right: bounds.content.right,
          bottom: bounds.viewport.bottom
        })
      }),
      sTestScenario({
        label: 'Iframe(full view): Bottom of the header -> Bottom of the editor container',
        settings: { },
        scroll: { relativeTop: true, delta: -10 },
        assertBounds: (bounds: TestBounds) => ({
          x: bounds.content.x,
          y: bounds.header.bottom,
          right: bounds.content.right,
          bottom: bounds.container.bottom
        })
      }),
      sTestScenario({
        label: 'Iframe(editor partly in view): Top of viewport -> Bottom of the editor container',
        settings: { height: 400 },
        scroll: { relativeTop: true, delta: 200 },
        assertBounds: (bounds: TestBounds) => ({
          x: bounds.content.x,
          y: bounds.viewport.y,
          right: bounds.content.right,
          bottom: bounds.container.bottom
        })
      }),
      sTestScenario({
        label: 'Iframe(editor partly in view): Bottom of viewport -> Top of content area',
        settings: { height: 400 },
        scroll: { relativeTop: false, delta: -200 },
        assertBounds: (bounds: TestBounds) => ({
          x: bounds.content.x,
          y: bounds.content.y,
          right: bounds.content.right,
          bottom: bounds.viewport.bottom
        })
      })
    ])),

    Logger.t('Test Context toolbar bounds with toolbar bottom', GeneralSteps.sequence([
      sTestScenario({
        label: 'Iframe(full view): Bottom of the header -> Bottom of the editor container',
        settings: { toolbar_location: 'bottom' },
        scroll: { relativeTop: true, delta: -10 },
        assertBounds: (bounds: TestBounds) => ({
          x: bounds.content.x,
          y: bounds.container.y,
          right: bounds.content.right,
          bottom: bounds.header.y
        })
      }),
      sTestScenario({
        label: 'Inline(full view): Top of the viewport -> Top of the header',
        settings: { inline: true, toolbar_location: 'bottom' },
        scroll: { relativeTop: true, delta: -10 },
        assertBounds: (bounds: TestBounds) => ({
          x: bounds.content.x,
          y: bounds.viewport.y,
          right: bounds.content.right,
          bottom: bounds.header.y
        })
      })
    ]))
  ], success, failure);
});
