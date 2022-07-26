import { RealKeys, Waiter } from '@ephox/agar';
import { before, describe, it } from '@ephox/bedrock-client';
import { Cell } from '@ephox/katamari';
import { TinyHooks, TinySelections, TinyUiActions } from '@ephox/wrap-mcagar';
import { assert } from 'chai';

import Editor from 'tinymce/core/api/Editor';

describe('webdriver.tinymce.core.content.PlaceholderTest', () => {
  const togglePlaceholderCount = Cell(0);
  const placeholder = 'Type here...';
  const hook = TinyHooks.bddSetupLight<Editor>({
    base_url: '/project/tinymce/js/tinymce',
    toolbar: 'undo redo | bold',
    placeholder,
    setup: (editor: Editor) => {
      editor.on('PlaceholderToggle', () => {
        togglePlaceholderCount.set(togglePlaceholderCount.get() + 1);
      });
    }
  }, []);

  before(() => hook.editor().focus());

  const clearCount = () => togglePlaceholderCount.set(0);
  const assertCount = (count: number) => {
    assert.equal(togglePlaceholderCount.get(), count, 'Assert PlaceholderToggle count');
  };

  const setContent = (editor: Editor, content: string) => {
    editor.setContent(content);
    clearCount();
  };

  const pAssertPlaceholder = (editor: Editor, expected: boolean) => Waiter.pTryUntil('Wait for placeholder to update', () => {
    const body = editor.getBody();
    const dataPlaceholder = editor.dom.getAttrib(body, 'data-mce-placeholder');
    const ariaPlaceholder = editor.dom.getAttrib(body, 'aria-placeholder');
    const expectedPlaceholder = expected ? placeholder : '';
    assert.equal(dataPlaceholder, expectedPlaceholder, 'Check data-mce-placeholder attribute');
    assert.equal(ariaPlaceholder, expectedPlaceholder, 'Check aria-placeholder attribute');
  });

  const pAssertPlaceholderExists = (editor: Editor) => pAssertPlaceholder(editor, true);
  const pAssertPlaceholderNotExists = (editor: Editor) => pAssertPlaceholder(editor, false);

  const pTypeTextAndDelete = async (editor: Editor) => {
    await RealKeys.pSendKeysOn('iframe => body => p', [ RealKeys.text('t') ]);
    await pAssertPlaceholderNotExists(editor);
    await RealKeys.pSendKeysOn('iframe => body => p', [ RealKeys.backspace() ]);
    await pAssertPlaceholderExists(editor);
  };

  it('TINY-3917: Check placeholder restores when deleting content via command', () => {
    const editor = hook.editor();
    setContent(editor, '<p>a</p>');
    TinySelections.setCursor(editor, [ 0, 0 ], 1);
    pAssertPlaceholderNotExists(editor);
    editor.execCommand('Delete');
    pAssertPlaceholderExists(editor);
    assertCount(1);
  });

  it('TINY-3917: Check placeholder shown with no content', async () => {
    const editor = hook.editor();
    setContent(editor, '<p></p>');
    await pAssertPlaceholderExists(editor);
  });

  it('TINY-3917: Check placeholder hidden with content', async () => {
    const editor = hook.editor();
    setContent(editor, '<p>Some content</p>');
    await pAssertPlaceholderNotExists(editor);
  });

  it('TINY-3917: Check placeholder hides when typing content and returns once content is deleted', async () => {
    const editor = hook.editor();
    setContent(editor, '<p></p>');
    await pAssertPlaceholderExists(editor);
    await pTypeTextAndDelete(editor);
    assertCount(2);
  });

  it('TINY-3917: Check placeholder hides when typing content, returns on undo and hides on redo', async () => {
    const editor = hook.editor();
    setContent(editor, '<p></p>');
    await pAssertPlaceholderExists(editor);
    await RealKeys.pSendKeysOn('iframe => body => p', [ RealKeys.text('t') ]);
    await pAssertPlaceholderNotExists(editor);
    TinyUiActions.clickOnToolbar(editor, '.tox-tbtn[title="Undo"]');
    await pAssertPlaceholderExists(editor);
    TinyUiActions.clickOnToolbar(editor, '.tox-tbtn[title="Redo"]');
    await pAssertPlaceholderNotExists(editor);
    assertCount(3);
  });

  it('TINY-3917: Press bold, type content, placeholder hides and returns once content is deleted', async () => {
    const editor = hook.editor();
    setContent(editor, '<p></p>');
    await pAssertPlaceholderExists(editor);
    TinyUiActions.clickOnToolbar(editor, '.tox-tbtn[title="Bold"]');
    await pAssertPlaceholderExists(editor);
    await pTypeTextAndDelete(editor);
    assertCount(2);
  });

  it('TINY-3917: Check placeholder hides when inserting content via command', async () => {
    const editor = hook.editor();
    setContent(editor, '<p></p>');
    await pAssertPlaceholderExists(editor);
    editor.execCommand('mceInsertContent', false, '<a href="#id">Link</a>');
    await pAssertPlaceholderNotExists(editor);
    assertCount(1);
  });

  it('TINY-3917: Check placeholder hides when inserting list via command', async () => {
    const editor = hook.editor();
    setContent(editor, '<p></p>');
    await pAssertPlaceholderExists(editor);
    editor.execCommand('InsertOrderedList');
    await pAssertPlaceholderNotExists(editor);
    assertCount(1);
  });

  it('TINY-4828: Check placeholder hides when pasting content into the editor', async () => {
    const editor = hook.editor();
    setContent(editor, '<p></p>');
    await pAssertPlaceholderExists(editor);
    // Note: This fakes a paste event
    editor.dispatch('paste');
    editor.getBody().innerHTML = '<p>Pasted content</p>';
    await pAssertPlaceholderNotExists(editor);
    assertCount(1);
  });
});
