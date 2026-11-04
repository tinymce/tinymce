import { ApproxStructure, Assertions, UiFinder } from '@ephox/agar';
import { describe, it } from '@ephox/bedrock-client';
import { Arr, Fun, Type } from '@ephox/katamari';
import { Css, Scroll, SugarBody, type SugarElement, SugarLocation, WindowVisualViewport } from '@ephox/sugar';
import { McEditor, TinyDom } from '@ephox/wrap-mcagar';
import { assert } from 'chai';

import type Editor from 'tinymce/core/api/Editor';
import type { RawEditorOptions } from 'tinymce/core/api/OptionTypes';
import { ToolbarMode } from 'tinymce/themes/silver/api/Options';

import { pOpenMore } from '../../module/MenuUtils';

describe('browser.tinymce.themes.silver.editor.SilverInlineEditorWidthTest', () => {

  const structureTest = (editor: Editor, container: SugarElement<Node>, maxWidth: number) =>
    Assertions.assertStructure(
      'Container structure',
      ApproxStructure.build((s, str, arr) => s.element('div', {
        classes: [ arr.has('tox-tinymce'), arr.has('tox-tinymce-inline') ],
        children: [
          s.element('div', {
            classes: [ arr.has('tox-editor-container') ],
            children: [
              s.element('div', {
                classes: [ arr.has('tox-editor-header') ],
                styles: {
                  'max-width': str.is(`${maxWidth}px`)
                },
                children: [
                  s.element('div', {
                    classes: [ arr.has('tox-toolbar-overlord') ],
                    attrs: { role: str.is('group') }
                  }),
                  s.element('div', {
                    classes: [ arr.has('tox-anchorbar') ]
                  })
                ]
              })
            ]
          }),
          s.element('div', {
            classes: [ arr.has('tox-throbber') ]
          })
        ]
      })),
      container
    );

  const assertWidth = (uiContainer: SugarElement<Node>, maxWidth: number, minWidth: number = 0) => {
    const overlord = UiFinder.findIn(uiContainer, '.tox-toolbar-overlord').getOrDie();
    const widthString = Css.get(overlord, 'width') || '0px';
    const width = parseInt(widthString.replace('px', ''), 10);
    assert.isAtMost(width, maxWidth, `Toolbar with should be less than ${maxWidth}px - ${width}<=${maxWidth}`);
    assert.isAtLeast(width, minWidth, `Toolbar with should be greater than ${minWidth}px - ${width}>=${minWidth}`);
    assert.isAbove(width, 0, 'Toolbar should not be collapsed');
  };

  const testRender = (options: RawEditorOptions, getExpectedWidth: number | ((editor: Editor) => number), pActions?: (editor: Editor) => Promise<void>, minWidthBelow = 100) => async () => {
    Scroll.to(0, 0);
    const editor = await McEditor.pFromSettings<Editor>({
      menubar: false,
      inline: true,
      base_url: '/project/tinymce/js/tinymce',
      toolbar_mode: 'floating',
      ...options
    });
    editor.focus();
    await UiFinder.pWaitForVisible('Wait for the editor to show', SugarBody.body(), '.tox-editor-header');
    const uiContainer = TinyDom.container(editor);
    const expectedWidth = Type.isFunction(getExpectedWidth) ? getExpectedWidth(editor) : getExpectedWidth;

    structureTest(editor, uiContainer, expectedWidth);
    assertWidth(uiContainer, expectedWidth, expectedWidth - minWidthBelow);
    editor.setContent(Arr.range(100, Fun.constant('<p></p>')).join(''));
    Scroll.to(0, 500);
    await UiFinder.pWaitForVisible('Wait to be docked', SugarBody.body(), '.tox-tinymce--toolbar-sticky-on .tox-editor-header');
    assertWidth(uiContainer, expectedWidth, expectedWidth - minWidthBelow);

    // Run optional additional actions
    if (Type.isNonNullable(pActions)) {
      await pActions(editor);
    }

    McEditor.remove(editor);
  };

  it('Check max-width is 400px when set via init', testRender({ width: 400 }, 400));

  it('Check max-width is 400px when set via element', testRender({
    setup: (ed: Editor) => {
      Css.set(TinyDom.targetElement(ed), 'width', '400px');
    }
  }, 400));

  // TINY-10684: with no width set the toolbar is capped to the visual viewport, less the target's left offset and a 10px
  // margin. The toolbar itself only takes its natural width, so no lower bound applies.
  it('Check max-width is constrained to the viewport width when no width set', testRender({},
    (editor) => WindowVisualViewport.getBounds().width - SugarLocation.viewport(TinyDom.targetElement(editor)).left - 10,
    undefined,
    Number.MAX_SAFE_INTEGER
  ));

  it('Check width when expanding sliding toolbar while docked', testRender({
    toolbar_mode: 'sliding',
    width: 400
  }, 400, async (editor) => {
    await pOpenMore(ToolbarMode.sliding);
    assertWidth(TinyDom.container(editor), 400, 300);
  }));
});
