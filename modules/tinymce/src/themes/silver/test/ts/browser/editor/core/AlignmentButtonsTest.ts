import { ApproxStructure, Assertions, UiFinder } from '@ephox/agar';
import { context, describe, it } from '@ephox/bedrock-client';
import { SugarBody } from '@ephox/sugar';
import { TinyHooks, TinySelections, TinyState } from '@ephox/wrap-mcagar';

import Editor from 'tinymce/core/api/Editor';

import { extractOnlyOne } from '../../../module/UiUtils';

describe('browser.tinymce.themes.silver.editor.core.AlignmentButtonsTest', () => {
  const hook = TinyHooks.bddSetupLight<Editor>({
    toolbar: 'alignleft aligncenter alignright alignjustify alignnone',
    toolbar_mode: 'wrap',
    base_url: '/project/tinymce/js/tinymce'
  }, []);

  it('TBA: Toolbar alignment buttons structure', () => {
    const toolbar = extractOnlyOne(SugarBody.body(), '.tox-toolbar');
    Assertions.assertStructure(
      'Checking toolbar should have just alignment buttons',
      ApproxStructure.build((s, str, arr) => s.element('div', {
        classes: [ arr.has('tox-toolbar') ],
        children: [
          s.element('div', {
            classes: [ arr.has('tox-toolbar__group') ],
            children: [
              s.element('button', {
                attrs: { title: str.is('Align left') }
              }),
              s.element('button', {
                attrs: { title: str.is('Align center') }
              }),
              s.element('button', {
                attrs: { title: str.is('Align right') }
              }),
              s.element('button', {
                attrs: { title: str.is('Justify') }
              }),
              s.element('button', {
                attrs: { title: str.is('No alignment') }
              })
            ]
          })
        ]
      })),
      toolbar
    );
  });

  context('Noneditable root', () => {
    const testDisableOnNoneditable = (title: string) => () => {
      TinyState.withNoneditableRootEditor(hook.editor(), (editor) => {
        editor.setContent('<div>Noneditable content</div><div contenteditable="true">Editable content</div>');
        TinySelections.setSelection(editor, [ 0, 0 ], 0, [ 0, 0 ], 2);
        UiFinder.exists(SugarBody.body(), `[aria-label="${title}"][aria-disabled="true"]`);
        TinySelections.setSelection(editor, [ 1, 0 ], 0, [ 1, 0 ], 2);
        UiFinder.exists(SugarBody.body(), `[aria-label="${title}"][aria-disabled="false"]`);
      });
    };

    it('TINY-9669: Disable alignleft on noneditable content', testDisableOnNoneditable('Align left'));
    it('TINY-9669: Disable aligncenter on noneditable content', testDisableOnNoneditable('Align center'));
    it('TINY-9669: Disable alignright on noneditable content', testDisableOnNoneditable('Align right'));
    it('TINY-9669: Disable alignjustify on noneditable content', testDisableOnNoneditable('Justify'));
    it('TINY-9669: Disable alignnone on noneditable content', testDisableOnNoneditable('No alignment'));
  });
});
