import { ApproxStructure, Assertions, UiFinder } from '@ephox/agar';
import { describe, it } from '@ephox/bedrock-client';
import { Arr, Fun, Type } from '@ephox/katamari';
import { Css, Scroll, SugarBody, SugarElement } from '@ephox/sugar';
import { McEditor, TinyDom } from '@ephox/wrap-mcagar';
import { assert } from 'chai';

import Editor from 'tinymce/core/api/Editor';
import { RawEditorOptions } from 'tinymce/core/api/OptionTypes';
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
  };

  const testRender = (options: RawEditorOptions, expectedWidth: number, pActions?: (editor: Editor) => Promise<void>) => async () => {
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

    structureTest(editor, uiContainer, expectedWidth);
    assertWidth(uiContainer, expectedWidth, expectedWidth - 100);
    editor.setContent(Arr.range(100, Fun.constant('<p></p>')).join(''));
    Scroll.to(0, 500);
    await UiFinder.pWaitForVisible('Wait to be docked', SugarBody.body(), '.tox-tinymce--toolbar-sticky-on .tox-editor-header');
    assertWidth(uiContainer, expectedWidth, expectedWidth - 100);

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

  it('Check max-width is constrained to the body width when no width set', testRender({
    setup: (ed: Editor) => {
      ed.on('PreInit', () => {
        Css.set(SugarBody.body(), 'width', '400px');
      });
      ed.on('remove', () => {
        Css.remove(SugarBody.body(), 'width');
      });
    }
  }, 400));

  it('Check width when expanding sliding toolbar while docked', testRender({
    toolbar_mode: 'sliding',
    width: 400
  }, 400, async (editor) => {
    await pOpenMore(ToolbarMode.sliding);
    assertWidth(TinyDom.container(editor), 400, 300);
  }));
});
