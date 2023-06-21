import { Waiter } from '@ephox/agar';
import { describe, it } from '@ephox/bedrock-client';
import { TinyAssertions, TinyHooks } from '@ephox/wrap-mcagar';

import Editor from 'tinymce/core/api/Editor';

import * as DragDropUtils from '../../module/test/DragDropUtils';
import * as InputEventUtils from '../../module/test/InputEventUtils';

describe('browser.tinymce.core.paste.DragDropSummaryTest', () => {
  const hook = TinyHooks.bddSetupLight<Editor>({
    base_url: '/project/tinymce/js/tinymce',
    indent: false
  }, []);

  it('TINY-9960: Dropping a H1 internally into a summary element should unwrap it', async () => {
    const editor = hook.editor();

    editor.setContent('<details><summary>bc</summary><div>body</div></details>');
    DragDropUtils.dragDropHtmlInternallyToPath(editor, '<h1>a</h1>', [ 0, 0 ]);

    await Waiter.pTryUntil('Waited for content to be inserted', () => {
      TinyAssertions.assertContent(editor, '<details><summary>abc</summary><div>body</div></details>');
    });
  });

  it('TINY-9960: Dropping a H1 externally into a summary element should unwrap it', async () => {
    const editor = hook.editor();

    editor.setContent('<details><summary>bc</summary><div>body</div></details>');
    DragDropUtils.dragDropHtmlExternallyToPath(editor, '<h1>a</h1>', [ 0, 0 ]);

    await Waiter.pTryUntil('Waited for content to be inserted', () => {
      TinyAssertions.assertContent(editor, '<details><summary>abc</summary><div>body</div></details>');
    });
  });

  it('TINY-9960: Delete by drag should add back missing summary element', () => {
    const editor = hook.editor();

    editor.setContent('<details><div>body</div></details>', { format: 'raw' });
    TinyAssertions.assertContentPresence(editor, { 'summary': 0, 'summary > br': 0 });
    editor.dispatch('input', InputEventUtils.makeInputEvent('input', { inputType: 'deleteByDrag' }));
    TinyAssertions.assertContentPresence(editor, { 'summary': 1, 'summary > br': 1 });
    TinyAssertions.assertContent(editor, '<details><summary>&nbsp;</summary><div>body</div></details>');
  });

  it('TINY-9960: Delete by drag should add back missing summary element and trim leading BR', () => {
    const editor = hook.editor();

    editor.setContent('<details><br><div>body</div></details>', { format: 'raw' });
    TinyAssertions.assertContentPresence(editor, { 'summary': 0, 'details > br': 1, 'summary > br': 0 });
    editor.dispatch('input', InputEventUtils.makeInputEvent('input', { inputType: 'deleteByDrag' }));
    TinyAssertions.assertContentPresence(editor, { 'summary': 1, 'details > br': 0, 'summary > br': 1 });
    TinyAssertions.assertContent(editor, '<details><summary>&nbsp;</summary><div>body</div></details>');
  });
});

