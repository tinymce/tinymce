import { Clipboard, Waiter } from '@ephox/agar';
import { describe, it } from '@ephox/bedrock-client';
import { TinyAssertions, TinyDom, TinyHooks, TinySelections } from '@ephox/wrap-mcagar';

import Editor from 'tinymce/core/api/Editor';

describe('browser.tinymce.core.lists.CutDeleteTest', () => {
  const hook = TinyHooks.bddSetupLight<Editor>({
    plugins: '',
    indent: false,
    base_url: '/project/tinymce/js/tinymce'
  } );

  it('TINY-8078: Delete command should normalize list structures', () => {
    const editor = hook.editor();
    editor.setContent('<ul><li>a</li><li>b<ul><li>c</li></ul></li></ul><p>d</p>');

    TinySelections.setSelection(editor, [ 0, 0, 0 ], 0, [ 0, 1, 1, 0, 0 ], 1);
    editor.execCommand('Delete');
    TinyAssertions.assertContent(editor, '<ul><li style="list-style-type: none;"><ul><li>&nbsp;</li></ul></li></ul><p>d</p>');
  });

  it('TINY-8078: ForwardDelete command should normalize list structures', () => {
    const editor = hook.editor();
    editor.setContent('<ul><li>a</li><li>b<ul><li>c</li></ul></li></ul><p>d</p>');

    TinySelections.setSelection(editor, [ 0, 0, 0 ], 0, [ 0, 1, 1, 0, 0 ], 1);
    editor.execCommand('ForwardDelete');
    TinyAssertions.assertContent(editor, '<ul><li style="list-style-type: none;"><ul><li>&nbsp;</li></ul></li></ul><p>d</p>');
  });

  it('TINY-8078: Cut should normalize list structures', async () => {
    const editor = hook.editor();
    editor.setContent('<ul><li>a</li><li>b<ul><li>c</li></ul></li></ul><p>d</p>');

    TinySelections.setSelection(editor, [ 0, 0, 0 ], 0, [ 0, 1, 1, 0, 0 ], 1);
    Clipboard.cut(TinyDom.body(editor));

    await Waiter.pTryUntil('Waited for content to get deleted and normalized', () => {
      TinyAssertions.assertContent(editor, '<ul><li style="list-style-type: none;"><ul><li>&nbsp;</li></ul></li></ul><p>d</p>');
    });
  });
});
