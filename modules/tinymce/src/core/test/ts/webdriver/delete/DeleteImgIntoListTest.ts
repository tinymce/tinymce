import { Keys, RealKeys } from '@ephox/agar';
import { describe, it } from '@ephox/bedrock-client';
import { TinyAssertions, TinyContentActions, TinyHooks, TinySelections } from '@ephox/wrap-mcagar';

import Editor from 'tinymce/core/api/Editor';

describe('webdriver.tinymce.core.delete.DeleteImgIntoListTest', () => {

  const hook = TinyHooks.bddSetupLight<Editor>({
    base_url: '/project/tinymce/js/tinymce'
  }, [], true);

  it('TINY-10892: Backspace from beginning of P that contains IMG into OL when the LI does NOT end with an inline element', async () => {
    const editor = hook.editor();
    editor.setContent(
      `<ol>
  <li>sdadsa</li>
  </ol>
  <p><em>sdada</em><img src="#" alt="" width="24" height="24"> dsada </p>`);
    editor.selection.setCursorLocation(editor.getDoc().querySelector('em') as HTMLElement, 0);
    await RealKeys.pSendKeysOn('iframe => body => em', [ RealKeys.backspace() ]);
    TinyAssertions.assertContent(editor,
      `<ol>
<li>sdadsa<em>sdada</em><img src="#" alt="" width="24" height="24"> dsada</li>
</ol>`
    );
  });

  it('TINY-10892: Backspace from beginning of P that contains IMG into OL when the LI DOES end with an inline element', async () => {
    const editor = hook.editor();
    editor.setContent(
      `<ol>
  <li>sdadsa <strong>a</strong></li>
  </ol>
  <p><em>sdada</em><img src="#" alt="" width="24" height="24"> dsada </p>`);
    editor.selection.setCursorLocation(editor.getDoc().querySelector('em') as HTMLElement, 0);
    await RealKeys.pSendKeysOn('iframe => body => em', [ RealKeys.backspace() ]);
    TinyAssertions.assertContent(editor,
      `<ol>
<li>sdadsa <strong>a</strong><em>sdada</em><img src="#" alt="" width="24" height="24"> dsada</li>
</ol>`
    );
  });

  it('TINY-10892: Delete from end of OL when the LI does NOT end with an inline element and has nextSibling P that contains IMG', async () => {
    const editor = hook.editor();
    editor.setContent(
      `<ol>
  <li>a</li>
  </ol>
  <p><em>sdada</em><img src="#" alt="" width="24" height="24"> dsada </p>`);
    TinySelections.setCursor(editor, [ 0, 0, 0 ], 1);
    TinyContentActions.keystroke(editor, Keys.delete());
    TinyAssertions.assertContent(editor,
      `<ol>
<li>a<em>sdada</em><img src="#" alt="" width="24" height="24"> dsada</li>
</ol>`
    );
  });

  it('TINY-10892: Delete from end of OL when the LI DOES end with an inline element and has nextSibling P that contains IMG', async () => {
    const editor = hook.editor();
    editor.setContent(
      `<ol>
  <li>a <strong>a</strong></li>
  </ol>
  <p><em>sdada</em><img src="#" alt="" width="24" height="24"> dsada </p>`);
    editor.selection.setCursorLocation(editor.getDoc().querySelector('strong') as HTMLElement, 1);
    TinyContentActions.keystroke(editor, Keys.delete());
    TinyAssertions.assertContent(editor,
      `<ol>
<li>a <strong>a</strong><em>sdada</em><img src="#" alt="" width="24" height="24"> dsada</li>
</ol>`
    );
  });

  it('TINY-10892: Backspace from beginning of P that contains IMG into UL when the LI does NOT end with an inline element', async () => {
    const editor = hook.editor();
    editor.setContent(
      `<ul>
  <li>sdadsa</li>
  </ul>
  <p><em>sdada</em><img src="#" alt="" width="24" height="24"> dsada </p>`);
    editor.selection.setCursorLocation(editor.getDoc().querySelector('em') as HTMLElement, 0);
    await RealKeys.pSendKeysOn('iframe => body => em', [ RealKeys.backspace() ]);
    TinyAssertions.assertContent(editor,
      `<ul>
<li>sdadsa<em>sdada</em><img src="#" alt="" width="24" height="24"> dsada</li>
</ul>`
    );
  });

  it('TINY-10892: Backspace from beginning of P that contains IMG into UL when the LI DOES end with an inline element', async () => {
    const editor = hook.editor();
    editor.setContent(
      `<ul>
  <li>sdadsa <strong>a</strong></li>
  </ul>
  <p><em>sdada</em><img src="#" alt="" width="24" height="24"> dsada </p>`);
    editor.selection.setCursorLocation(editor.getDoc().querySelector('em') as HTMLElement, 0);
    await RealKeys.pSendKeysOn('iframe => body => em', [ RealKeys.backspace() ]);
    TinyAssertions.assertContent(editor,
      `<ul>
<li>sdadsa <strong>a</strong><em>sdada</em><img src="#" alt="" width="24" height="24"> dsada</li>
</ul>`
    );
  });

  it('TINY-10892: Delete from end of UL when the LI does NOT end with an inline element and has nextSibling P that contains IMG', async () => {
    const editor = hook.editor();
    editor.setContent(
      `<ul>
  <li>a</li>
  </ul>
  <p><em>sdada</em><img src="#" alt="" width="24" height="24"> dsada </p>`);
    editor.selection.setCursorLocation(editor.getDoc().querySelector('li') as HTMLElement, 1);
    TinyContentActions.keystroke(editor, Keys.delete());
    TinyAssertions.assertContent(editor,
      `<ul>
<li>a<em>sdada</em><img src="#" alt="" width="24" height="24"> dsada</li>
</ul>`
    );
  });

  it('TINY-10892: Delete from end of UL when the LI DOES end with an inline element and has nextSibling P that contains IMG', async () => {
    const editor = hook.editor();
    editor.setContent(
      `<ul>
  <li>a <strong>a</strong></li>
  </ul>
  <p><em>sdada</em><img src="#" alt="" width="24" height="24"> dsada </p>`);
    editor.selection.setCursorLocation(editor.getDoc().querySelector('strong') as HTMLElement, 1);
    TinyContentActions.keystroke(editor, Keys.delete());
    TinyAssertions.assertContent(editor,
      `<ul>
<li>a <strong>a</strong><em>sdada</em><img src="#" alt="" width="24" height="24"> dsada</li>
</ul>`
    );
  });

});
