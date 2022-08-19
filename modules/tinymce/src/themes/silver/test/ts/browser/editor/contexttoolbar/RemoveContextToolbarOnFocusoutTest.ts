import { UiFinder, Waiter } from '@ephox/agar';
import { after, before, describe, it } from '@ephox/bedrock-client';
import { Fun } from '@ephox/katamari';
import { Focus, Insert, Remove, SugarBody, SugarElement } from '@ephox/sugar';
import { McEditor, TinySelections } from '@ephox/wrap-mcagar';

import Editor from 'tinymce/core/api/Editor';

describe('browser.tinymce.themes.silver.editor.contexttoolbar.RemoveContextToolbarOnFocusoutTest', () => {
  let inputElm: SugarElement<HTMLInputElement>;
  before(() => {

    inputElm = SugarElement.fromTag('input');
    Insert.append(SugarBody.body(), inputElm);
  });

  after(() => {
    Remove.remove(inputElm);
  });

  const focusInput = () => Focus.focus(inputElm);

  const pWaitForContextToolbarState = (state: boolean) => Waiter.pTryUntil(
    `Wait for context toolbar to ${state ? 'appear' : 'disappear'}`,
    () => {
      const assert = state ? UiFinder.exists : UiFinder.notExists;
      assert(SugarBody.body(), '.tox-pop');
    }
  );

  const html = '<p>One <a href="http://tiny.cloud">link</a> Two</p>';

  const setup = (ed: Editor) => {
    ed.ui.registry.addButton('alpha', {
      text: 'Alpha',
      onAction: Fun.noop
    });
    ed.ui.registry.addContextToolbar('test-toolbar', {
      predicate: (node) => node.nodeName.toLowerCase() === 'a',
      items: 'alpha'
    });
  };

  it('iframe editor focusout should remove context toolbar', async () => {
    const editor = await McEditor.pFromHtml<Editor>(html, { setup, base_url: '/project/tinymce/js/tinymce' });
    editor.focus();
    TinySelections.setCursor(editor, [ 0, 1, 0 ], 1);
    await pWaitForContextToolbarState(true);
    focusInput();
    await pWaitForContextToolbarState(false);
    McEditor.remove(editor);
  });

  it('inline editor focusout should remove context toolbar', async () => {
    const editor = await McEditor.pFromHtml<Editor>(html, { setup, inline: true, base_url: '/project/tinymce/js/tinymce' });
    editor.focus();
    TinySelections.setCursor(editor, [ 1, 0 ], 1);
    await pWaitForContextToolbarState(true);
    focusInput();
    await pWaitForContextToolbarState(false);
    McEditor.remove(editor);
  });
});
