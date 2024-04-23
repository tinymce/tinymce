import { FocusTools, Keyboard, Keys, TestStore } from '@ephox/agar';
import { after, afterEach, before, describe, it } from '@ephox/bedrock-client';
import { DomEvent, EventUnbinder, SugarBody, SugarDocument } from '@ephox/sugar';
import { TinyContentActions, TinyHooks, TinySelections, TinyUiActions } from '@ephox/wrap-mcagar';

import Editor from 'tinymce/core/api/Editor';
import LinkPlugin from 'tinymce/plugins/link/Plugin';

describe('browser.tinymce.plugins.link.OpenLinkContextMenuTest', () => {
  const store = TestStore<string>();

  const hook = TinyHooks.bddSetupLight<Editor>({
    plugins: 'link',
    toolbar: 'link',
    indent: false,
    base_url: '/project/tinymce/js/tinymce',
    image_caption: true,
  }, [ LinkPlugin ], true);

  const pAssertFocusOnItem = (label: string, selector: string) =>
    FocusTools.pTryOnSelector(`Focus should be on: ${label}`, SugarDocument.getDocument(), selector);
  let unbinder: EventUnbinder;

  before(() => {
    unbinder = DomEvent.bind(SugarBody.body(), 'click', (e) => {
      store.add((e.target.dom as HTMLAnchorElement).href);
    });
  });

  after(() => {
    unbinder.unbind();
  });

  afterEach(() => {
    store.clear();
  });

  it('TINY-10391: Should open a new tab when triggering open link on a link inside selection', async () => {
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

  it('TINY-10391: Should open a new tab when triggering open link on a link with selection expanded to the surroundings', async () => {
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

  it('TINY-10391: Pressing Alt (Option on Mac) + Enter when the cursor is within a link should open a new tab', async () => {
    const editor = hook.editor();
    editor.setContent('<p>one <a href="https://www.exampletwo.com">Example</a> two</p>');
    // Select `e Example`
    TinySelections.setCursor(editor, [ 0, 1, 0 ], 4);
    TinyContentActions.keydown(editor, Keys.enter(), {
      altKey: true,
    });
    store.assertEq('Should open the targeted link', [
      'https://www.exampletwo.com/'
    ]);
  });

  it('TINY-10391: Triggering Ctrl + click on a link inside selection should open a new tab', async () => {
    const editor = hook.editor();
    editor.setContent('<p>Link <a href="https://www.one.com">One</a> and link <a href="https://www.two.com">Two</a></p>');
    // Select `nk One and link Two`
    TinySelections.setSelection(editor, [ 0, 0 ], 2, [ 0, 3, 0 ], 3);
    editor.dispatch('click', { target: editor.dom.select('a')[0], metaKey: true } as any);
    store.assertEq('Should open the targeted link', [
      'https://www.one.com/'
    ]);
  });
});
