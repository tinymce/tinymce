import { Keys, TestStore, UiFinder } from '@ephox/agar';
import { after, afterEach, before, beforeEach, describe, it } from '@ephox/bedrock-client';
import { PlatformDetection } from '@ephox/sand';
import { DomEvent, type EventUnbinder, SugarBody } from '@ephox/sugar';
import { TinyContentActions, TinyDom, TinyHooks, TinySelections, TinyUiActions } from '@ephox/wrap-mcagar';
import { assert } from 'chai';

import type Editor from 'tinymce/core/api/Editor';
import LinkPlugin from 'tinymce/plugins/link/Plugin';

import { pAssertFocusOnItem } from '../module/Utils';

describe('browser.tinymce.plugins.link.OpenLinkContextMenuTest', () => {
  let unbinder: EventUnbinder;
  const store = TestStore<string>();
  const hook = TinyHooks.bddSetupLight<Editor>({
    plugins: 'link',
    toolbar: 'link',
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

  it('TINY-10391: Should open a new tab when triggering open link on a link inside selection', async () => {
    const editor = hook.editor();
    editor.setContent('<p>one <a href="https://www.exampleone.com/">Example</a> two</p>');
    TinySelections.select(editor, 'p', []);
    await TinyUiActions.pTriggerContextMenu(editor, 'a', '.tox-silver-sink [role="menuitem"]');
    TinyUiActions.keydown(editor, Keys.down());
    TinyUiActions.keydown(editor, Keys.down());
    await pAssertFocusOnItem('Open link', '.tox-collection__item:contains("Open link")');
    TinyUiActions.keydown(editor, Keys.enter());
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
    TinyUiActions.keydown(editor, Keys.down());
    TinyUiActions.keydown(editor, Keys.down());
    await pAssertFocusOnItem('Open link', '.tox-collection__item:contains("Open link")');
    TinyUiActions.keydown(editor, Keys.enter());
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
    const os = PlatformDetection.detect().os;
    editor.setContent('<p>Link <a href="https://www.one.com">One</a> and link <a href="https://www.two.com">Two</a></p>');
    // Select `nk One and link Two`
    TinySelections.setSelection(editor, [ 0, 0 ], 2, [ 0, 3, 0 ], 3);
    const keyConfig = os.isMacOS() || os.isiOS() ? { metaKey: true } : { ctrlKey: true };
    editor.dispatch('click', { target: editor.dom.select('a')[0], ...keyConfig } as any);
    store.assertEq('Should open the targeted link', [
      'https://www.one.com/'
    ]);
  });

  it('TINY-10391: Should open a new tab when triggering open link on an image with embedded link', async () => {
    const editor = hook.editor();
    editor.setContent('<p><a href="https://www.exampleimage.com"><img src="http://www.example.image/image"></a></p>');
    // Open link context menu on the link
    await TinyUiActions.pTriggerContextMenu(editor, 'img', '.tox-silver-sink [role="menuitem"]');
    TinyUiActions.keydown(editor, Keys.down());
    TinyUiActions.keydown(editor, Keys.down());
    await pAssertFocusOnItem('Open link', '.tox-collection__item:not([aria-disabled="true"]):contains("Open link")');
    TinyUiActions.keydown(editor, Keys.enter());
    store.assertEq('Should open the targeted link', [
      'https://www.exampleimage.com/'
    ]);
  });

  describe('Anchor links with special characters should not throw querySelectorAll errors', () => {
    it('TINYMCE-8784: Should handle anchor link with one semicolon from context menu', async () => {
      const editor = hook.editor();
      editor.setContent('<p><a href="#someBookmark;somekey=somevalue">internal bookmark</a></p><div style="padding-top: 2000px;"></div><p><a id="someBookmark;somekey=somevalue"></a></p>');
      TinySelections.setCursor(editor, [ 0, 0, 0 ], 4);
      await TinyUiActions.pTriggerContextMenu(editor, 'a', '.tox-silver-sink [role="menuitem"]');
      TinyUiActions.keydown(editor, Keys.down());
      TinyUiActions.keydown(editor, Keys.down());
      await pAssertFocusOnItem('Open link', '.tox-collection__item:contains("Open link")');
      TinyUiActions.keydown(editor, Keys.enter());
      store.assertEq('Should not throw an error and should not attempt to open external link', []);
    });

    it('TINYMCE-8784: Should handle anchor link with multiple semicolons from Alt+Enter', async () => {
      const editor = hook.editor();
      editor.setContent('<p><a href="#someBookmark;somekey=somevalue;somekey2=somevalue2">internal bookmark</a></p><div style="padding-top: 2000px;"></div><p><a id="someBookmark;somekey=somevalue;somekey2=somevalue2"></a></p>');
      TinySelections.setCursor(editor, [ 0, 0, 0 ], 4);
      TinyContentActions.keydown(editor, Keys.enter(), {
        altKey: true,
      });
      store.assertEq('Should not throw an error and should not attempt to open external link', []);
    });
  });

  describe('Anchor links into closed details', () => {
    const linkAndSpacer = '<p><a href="#someBookmark">internal bookmark</a></p><div style="padding-top: 2000px;"></div>';

    const getDetails = (editor: Editor, selector: string): HTMLDetailsElement =>
      UiFinder.findIn<HTMLDetailsElement>(TinyDom.body(editor), selector).getOrDie().dom;

    const followAnchorLink = (editor: Editor): void => {
      TinySelections.setCursor(editor, [ 0, 0, 0 ], 4);
      TinyContentActions.keydown(editor, Keys.enter(), { altKey: true });
    };

    const assertTargetInView = (editor: Editor): void => {
      const { top, bottom } = UiFinder.findIn<HTMLElement>(TinyDom.body(editor), '#someBookmark').getOrDie().dom.getBoundingClientRect();
      assert.isAtLeast(top, 0, 'Target should start inside the viewport');
      assert.isAtMost(bottom, editor.getWin().innerHeight, 'Target should end inside the viewport');
    };

    beforeEach(() => hook.editor().getWin().scrollTo(0, 0));

    it('TINYMCE-14737: Should open the closed details around the target', () => {
      const editor = hook.editor();
      editor.setContent(linkAndSpacer + '<details><summary>Summary</summary><p id="someBookmark">target</p></details>');
      followAnchorLink(editor);
      assert.isTrue(getDetails(editor, 'details').open, 'Details should have been opened');
      assertTargetInView(editor);
    });

    it('TINYMCE-14737: Should open every closed details around the target', () => {
      const editor = hook.editor();
      editor.setContent(linkAndSpacer + '<details id="outer-details"><summary>Outer</summary><details id="inner-details"><summary>Inner</summary><p id="someBookmark">target</p></details></details>');
      followAnchorLink(editor);
      assert.isTrue(getDetails(editor, '#outer-details').open, 'Outer details should have been opened');
      assert.isTrue(getDetails(editor, '#inner-details').open, 'Inner details should have been opened');
      assertTargetInView(editor);
    });

    it('TINYMCE-14737: Should leave the details closed when the target is in its summary', () => {
      const editor = hook.editor();
      editor.setContent(linkAndSpacer + '<details><summary><span id="someBookmark">Summary</span></summary><p>body</p></details>');
      followAnchorLink(editor);
      assert.isFalse(getDetails(editor, 'details').open, 'Details should still be closed');
      assertTargetInView(editor);
    });
  });
});
