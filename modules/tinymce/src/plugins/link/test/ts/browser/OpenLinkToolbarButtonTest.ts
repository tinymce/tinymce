import { TestStore } from '@ephox/agar';
import { after, afterEach, before, describe, it } from '@ephox/bedrock-client';
import { DomEvent, EventUnbinder, SugarBody } from '@ephox/sugar';
import { TinyHooks, TinySelections, TinyUiActions } from '@ephox/wrap-mcagar';

import Editor from 'tinymce/core/api/Editor';
import LinkPlugin from 'tinymce/plugins/link/Plugin';

describe('browser.tinymce.plugins.link.OpenLinkToolbarButtonTest', () => {
  let unbinder: EventUnbinder;
  const store = TestStore<string>();
  const hook = TinyHooks.bddSetupLight<Editor>({
    plugins: 'link',
    toolbar: 'openlink',
    indent: false,
    base_url: '/project/tinymce/js/tinymce',
    image_caption: true,
  }, [ LinkPlugin ], true);

  before(() => {
    unbinder = DomEvent.bind(SugarBody.body(), 'click', (e) => {
      // prevent click event bubbling up and open a new tab which is problematic in automatic testing
      e.prevent();
      e.stop();
      store.add((e.target.dom as HTMLAnchorElement).href);
    });
  });

  after(() => {
    unbinder?.unbind();
  });

  afterEach(() => {
    store.clear();
  });

  it('TINY-11009: Selection not in link should have disabled open link toolbar button', async () => {
    const editor = hook.editor();
    editor.setContent('<p>one <a href="https://www.exampleone.com/">Example</a> two</p>');
    TinySelections.setCursor(editor, [ 0, 0 ], 2);
    TinyUiActions.clickOnToolbar(editor, 'button[aria-label="Open link"]');
    store.assertEq('Should not open the targeted link', []);
  });

  it('TINY-11009: Selection in link should open that link from toolbar button', async () => {
    const editor = hook.editor();
    editor.setContent('<p>one <a href="https://www.exampleone.com/">Example</a> two</p>');
    TinySelections.setCursor(editor, [ 0, 1, 0 ], 4);
    TinyUiActions.clickOnToolbar(editor, 'button[aria-label="Open link"]');
    store.assertEq('Should open the targeted link', [
      'https://www.exampleone.com/'
    ]);
  });

  it('TINY-11009: Partial selection within link should open that link from toolbar button', async () => {
    const editor = hook.editor();
    editor.setContent('<p>one <a href="https://www.exampleone.com/">Example</a> two</p>');
    TinySelections.setSelection(editor, [ 0, 1, 0 ], 2, [ 0, 1, 0 ], 4);
    TinyUiActions.clickOnToolbar(editor, 'button[aria-label="Open link"]');
    store.assertEq('Should open the targeted link', [
      'https://www.exampleone.com/'
    ]);
  });

  it('TINY-11009: Partial selection of before and within link should open that link from toolbar button', async () => {
    const editor = hook.editor();
    editor.setContent('<p>one <a href="https://www.exampleone.com/">Example</a> two</p>');
    TinySelections.setSelection(editor, [ 0, 0 ], 2, [ 0, 1, 0 ], 4);
    TinyUiActions.clickOnToolbar(editor, 'button[aria-label="Open link"]');
    store.assertEq('Should open the targeted link', [
      'https://www.exampleone.com/'
    ]);
  });

  it('TINY-11009: Partial selection of within and after link should open that link from toolbar button', async () => {
    const editor = hook.editor();
    editor.setContent('<p>one <a href="https://www.exampleone.com/">Example</a> two</p>');
    TinySelections.setSelection(editor, [ 0, 1, 0 ], 2, [ 0, 2 ], 2);
    TinyUiActions.clickOnToolbar(editor, 'button[aria-label="Open link"]');
    store.assertEq('Should open the targeted link', [
      'https://www.exampleone.com/'
    ]);
  });

  it('TINY-11009: Selection of multiple links before first link and after last link should open first link from toolbar button', async () => {
    const editor = hook.editor();
    editor.setContent('<p>one <a href="https://www.exampleone.com/">Example</a> two <a href="https://www.exampletwo.com/">Example</a> three</p>');
    TinySelections.setSelection(editor, [ 0, 0 ], 2, [ 0, 4 ], 2);
    TinyUiActions.clickOnToolbar(editor, 'button[aria-label="Open link"]');
    store.assertEq('Should open the targeted link', [
      'https://www.exampleone.com/'
    ]);
  });

  it('TINY-11009: Selection of multiple links before first link and inside last link should open first link from toolbar button', async () => {
    const editor = hook.editor();
    editor.setContent('<p>one <a href="https://www.exampleone.com/">Example</a> two <a href="https://www.exampletwo.com/">Example</a> three</p>');
    TinySelections.setSelection(editor, [ 0, 0 ], 2, [ 0, 3, 0 ], 2);
    TinyUiActions.clickOnToolbar(editor, 'button[aria-label="Open link"]');
    store.assertEq('Should open the targeted link', [
      'https://www.exampleone.com/'
    ]);
  });

  it('TINY-11009: Selection of multiple links inside first link and inside last link should open first link from toolbar button', async () => {
    const editor = hook.editor();
    editor.setContent('<p>one <a href="https://www.exampleone.com/">Example</a> two <a href="https://www.exampletwo.com/">Example</a> three</p>');
    TinySelections.setSelection(editor, [ 0, 1, 0 ], 2, [ 0, 3, 0 ], 2);
    TinyUiActions.clickOnToolbar(editor, 'button[aria-label="Open link"]');
    store.assertEq('Should open the targeted link', [
      'https://www.exampleone.com/'
    ]);
  });

  it('TINY-11009: Selection of multiple links inside first link and after last link should open first link from toolbar button', async () => {
    const editor = hook.editor();
    editor.setContent('<p>one <a href="https://www.exampleone.com/">Example</a> two <a href="https://www.exampletwo.com/">Example</a> three</p>');
    TinySelections.setSelection(editor, [ 0, 1, 0 ], 2, [ 0, 4 ], 2);
    TinyUiActions.clickOnToolbar(editor, 'button[aria-label="Open link"]');
    store.assertEq('Should open the targeted link', [
      'https://www.exampleone.com/'
    ]);
  });
});
