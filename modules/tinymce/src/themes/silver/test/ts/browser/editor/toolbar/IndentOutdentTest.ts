import { Mouse, UiFinder } from '@ephox/agar';
import { context, describe, it } from '@ephox/bedrock-client';
import { Arr } from '@ephox/katamari';
import { Css, SugarBody } from '@ephox/sugar';
import { TinyDom, TinyHooks, TinySelections, TinyState } from '@ephox/wrap-mcagar';
import { assert } from 'chai';

import type Editor from 'tinymce/core/api/Editor';

describe('browser.tinymce.themes.silver.editor.toolbar.IndentOutdentTest', () => {
  const hook = TinyHooks.bddSetupLight<Editor>({
    base_url: '/project/tinymce/js/tinymce',
    toolbar: 'outdent indent',
  }, []);

  context('Noneditable root', () => {
    const testDisableOnNoneditable = (title: string) => () => {
      TinyState.withNoneditableRootEditor(hook.editor(), (editor) => {
        editor.setContent('<div><p style="padding-left: 40px">Noneditable content</p></div><div contenteditable="true"><p style="padding-left: 40px">Editable content</p></div>');
        TinySelections.setSelection(editor, [ 0, 0, 0 ], 0, [ 0, 0, 0 ], 2);
        UiFinder.exists(SugarBody.body(), `[aria-label="${title}"][aria-disabled="true"]`);
        TinySelections.setSelection(editor, [ 1, 0, 0 ], 0, [ 1, 0, 0 ], 2);
        UiFinder.exists(SugarBody.body(), `[aria-label="${title}"][aria-disabled="false"]`);
      });
    };

    it('TINY-9669: Disable outdent on noneditable content', testDisableOnNoneditable('Increase indent'));
    it('TINY-9669: Disable indent on noneditable content', testDisableOnNoneditable('Decrease indent'));
    it('TINY-14370: applying indent to multiple tds selection should apply the indentetion to all of them', () => {
      const editor = hook.editor();
      editor.setContent('<table><tbody><tr>' +
        '<td class="first">1</td>' +
        '<td>2</td>' +
        '<td class="last">3</td>' +
      '</tr></tbody></table>');

      const firstTd = UiFinder.findIn(TinyDom.body(editor), '.first').getOrDie();
      const lastTd = UiFinder.findIn(TinyDom.body(editor), '.last').getOrDie();
      Mouse.mouseDown(firstTd, { button: 0 });
      Mouse.mouseOver(lastTd, { button: 0 });
      Mouse.mouseUp(lastTd, { button: 0 });
      // this is enabled even if there is no indentation to have the same behavior as the test:
      // `"Outdent on multiple paragraphs without margin/padding"` in `OutdentCommandTest.ts`
      UiFinder.exists(SugarBody.body(), `[aria-label="Decrease indent"][aria-disabled="false"]`);
      editor.execCommand('indent');
      UiFinder.exists(SugarBody.body(), `[aria-label="Decrease indent"][aria-disabled="false"]`);
      const tds = UiFinder.findAllIn(TinyDom.body(editor), 'td');
      Arr.each(tds, (td) => {
        assert.isTrue(Css.getRaw(td, 'padding-left').isSome(), `td ${td.dom.innerHTML} should be indented`);
      });
    });
  });
});

