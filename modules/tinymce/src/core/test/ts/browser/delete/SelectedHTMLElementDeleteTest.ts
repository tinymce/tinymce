import { Clipboard, Keys, Waiter } from '@ephox/agar';
import { describe, it } from '@ephox/bedrock-client';
import { TinyAssertions, TinyContentActions, TinyDom, TinyHooks, TinySelections } from '@ephox/wrap-mcagar';

import Editor from 'tinymce/core/api/Editor';

describe('browser.tinymce.core.delete.SelectedHTMLElementDeleteTest', () => {
  const hook = TinyHooks.bddSetup<Editor>({
    base_url: '/project/tinymce/js/tinymce',
    indent: false
  }, [], true);

  it('TINY-12171: Delete the whole HTML element with backspace', async () => {
    const editor = hook.editor();
    editor.setContent('<div>This is a div</div><p>This is a p</p>');
    TinySelections.select(editor, 'div', []);

    TinyContentActions.keystroke(editor, Keys.backspace());

    await Waiter.pTryUntil(`The HTML element should be correctly deleted`,
      () => TinyAssertions.assertContent(editor, '<p>This is a p</p>')
    );
  });

  it('TINY-11868: Delete the whole HTML element inside table cell with backspace', async () => {
    const editor = hook.editor();
    editor.setContent('<table style="border-collapse: collapse; width: 100%;" border="1"><colgroup> <col style="width: 49.9417%;"> <col style="width: 49.9417%;"></colgroup><tbody><tr><td>'
      + '<div>This is a div</div><p>This is a p</p>'
      + '</td><td>&nbsp;</td></tr></tbody></table>');
    TinySelections.select(editor, 'div', []);

    TinyContentActions.keystroke(editor, Keys.backspace());

    await Waiter.pTryUntil(`The HTML element should be correctly deleted`,
      () => TinyAssertions.assertContent(editor, '<table style="border-collapse: collapse; width: 100%;" border="1"><colgroup><col style="width: 49.9417%;"><col style="width: 49.9417%;"></colgroup><tbody><tr><td>'
      + '<p>This is a p</p>'
      + '</td><td>&nbsp;</td></tr></tbody></table>')
    );
  });

  it('TINY-12171: Delete the whole HTML element with delete', async () => {
    const editor = hook.editor();
    editor.setContent('<div>This is a div</div><p>This is a p</p>');
    TinySelections.select(editor, 'div', []);

    TinyContentActions.keystroke(editor, Keys.delete());

    await Waiter.pTryUntil(`The HTML element should be correctly deleted`,
      () => TinyAssertions.assertContent(editor, '<p>This is a p</p>')
    );
  });

  it('TINY-11868: Delete the whole HTML element inside table cell with delete', async () => {
    const editor = hook.editor();
    editor.setContent('<table style="border-collapse: collapse; width: 100%;" border="1"><colgroup> <col style="width: 49.9417%;"> <col style="width: 49.9417%;"></colgroup><tbody><tr><td>'
      + '<div>This is a div</div><p>This is a p</p>'
      + '</td><td>&nbsp;</td></tr></tbody></table>');
    TinySelections.select(editor, 'div', []);

    TinyContentActions.keystroke(editor, Keys.delete());

    await Waiter.pTryUntil(`The HTML element should be correctly deleted`,
      () => TinyAssertions.assertContent(editor, '<table style="border-collapse: collapse; width: 100%;" border="1"><colgroup><col style="width: 49.9417%;"><col style="width: 49.9417%;"></colgroup><tbody><tr><td>'
      + '<p>This is a p</p>'
      + '</td><td>&nbsp;</td></tr></tbody></table>')
    );
  });

  it('TINY-12171: Delete the whole HTML element with cutting', async () => {
    const editor = hook.editor();
    editor.setContent('<div>This is a div</div><p>This is a p</p>');
    TinySelections.select(editor, 'div', []);

    Clipboard.cut(TinyDom.body(editor));

    await Waiter.pTryUntil(`The HTML element should be correctly deleted`,
      () => TinyAssertions.assertContent(editor, '<p>This is a p</p>')
    );
  });

  it('TINY-11868: Delete the whole HTML element inside table cell with cutting', async () => {
    const editor = hook.editor();
    editor.setContent('<table style="border-collapse: collapse; width: 100%;" border="1"><colgroup> <col style="width: 49.9417%;"> <col style="width: 49.9417%;"></colgroup><tbody><tr><td>'
      + '<div>This is a div</div><p>This is a p</p>'
      + '</td><td>&nbsp;</td></tr></tbody></table>');
    TinySelections.select(editor, 'div', []);

    Clipboard.cut(TinyDom.body(editor));

    await Waiter.pTryUntil(`The HTML element should be correctly deleted`,
      () => TinyAssertions.assertContent(editor, '<table style="border-collapse: collapse; width: 100%;" border="1"><colgroup><col style="width: 49.9417%;"><col style="width: 49.9417%;"></colgroup><tbody><tr><td>'
      + '<p>This is a p</p>'
      + '</td><td>&nbsp;</td></tr></tbody></table>')
    );
  });
});
