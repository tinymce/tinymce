import { FocusTools, Keyboard, Keys, TestStore } from '@ephox/agar';
import { afterEach, describe, it } from '@ephox/bedrock-client';
import { SugarDocument } from '@ephox/sugar';
import { TinyHooks, TinySelections, TinyUiActions } from '@ephox/wrap-mcagar';

import Editor from 'tinymce/core/api/Editor';
import LinkPlugin from 'tinymce/plugins/link/Plugin';

describe('browser.tinymce.plugins.link.OpenLinkContextMenuTest', () => {
  const store = TestStore<string>();

  const hook = TinyHooks.bddSetupLight<Editor>({
    plugins: 'link',
    toolbar: 'link',
    indent: false,
    base_url: '/project/tinymce/js/tinymce',
    image_caption: true
  }, [ LinkPlugin ], true);

  // Capture the href links being clicked
  document.addEventListener('click', (e) => {
    store.add((e.target as HTMLAnchorElement).href);
  });

  const pAssertFocusOnItem = (label: string, selector: string) =>
    FocusTools.pTryOnSelector(`Focus should be on: ${label}`, SugarDocument.getDocument(), selector);

  afterEach(() => {
    store.clear();
  });

  it('TINY-10391: Should open a new tab for a link inside the selected content', async () => {
    const editor = hook.editor();
    editor.setContent('<p>one <a href="https://www.exampleone.com/">Example</a> two</p>');
    TinySelections.select(editor, 'p', []);
    await TinyUiActions.pTriggerContextMenu(editor, 'a', '.tox-silver-sink [role="menuitem"]');
    Keyboard.activeKeydown(SugarDocument.getDocument(), Keys.down());
    Keyboard.activeKeydown(SugarDocument.getDocument(), Keys.down());
    await pAssertFocusOnItem('Open Link', '.tox-collection__item:contains("Open link")');
    Keyboard.activeKeydown(SugarDocument.getDocument(), Keys.enter());
    store.assertEq('Should open the targeted link', [
      'https://www.exampleone.com/'
    ]);
  });

  it('TINY-10391: Should open a new tab for a link with selection expanded to the surrounding content', async () => {
    const editor = hook.editor();
    editor.setContent('<p>one <a href="https://www.exampletwo.com">Example</a> two</p>');
    // Select `e Example`
    TinySelections.setSelection(editor, [ 0, 0 ], 2, [ 0, 1, 0 ], 6);
    await TinyUiActions.pTriggerContextMenu(editor, 'a[href="https://www.exampletwo.com"]', '.tox-silver-sink [role="menuitem"]');
    Keyboard.activeKeydown(SugarDocument.getDocument(), Keys.down());
    Keyboard.activeKeydown(SugarDocument.getDocument(), Keys.down());
    await pAssertFocusOnItem('Open Link', '.tox-collection__item:contains("Open link")');
    Keyboard.activeKeydown(SugarDocument.getDocument(), Keys.enter());
    store.assertEq('Should open the targeted link', [
      'https://www.exampletwo.com/'
    ]);
  });
});
