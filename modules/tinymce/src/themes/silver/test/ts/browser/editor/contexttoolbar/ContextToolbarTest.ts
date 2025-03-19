import { FocusTools, Keyboard, Keys, Mouse, TestStore, UiFinder, Waiter } from '@ephox/agar';
import { context, describe, it } from '@ephox/bedrock-client';
import { Css, SugarBody, SugarDocument } from '@ephox/sugar';
import { TinyDom, TinyHooks, TinySelections } from '@ephox/wrap-mcagar';
import { assert } from 'chai';

import Editor from 'tinymce/core/api/Editor';

describe('browser.tinymce.themes.silver.editor.contexttoolbar.ContextToolbarTest', () => {
  const store = TestStore();
  const hook = TinyHooks.bddSetupLight<Editor>({
    base_url: '/project/tinymce/js/tinymce',
    setup: (ed: Editor) => {
      ed.ui.registry.addButton('alpha', {
        text: 'Alpha',
        onAction: store.adder('alpha-exec')
      });
      ed.ui.registry.addContextToolbar('test-toolbar', {
        predicate: (node) => node.nodeName.toLowerCase() === 'a',
        items: 'alpha test-subtoolbar1'
      });

      for (let i = 1; i < 4; i++) {
        ed.ui.registry.addContextToolbar(`test-subtoolbar${i}`, {
          launch: {
            text: `Subtoolbar ${i}`
          },
          items: [ 'navigateback', 'alpha', 'test-subtoolbar' + (i + 1) ].join(' ')
        });
      }
    }
  }, [], true);

  const pWaitForContextToolbarDebounce = () => Waiter.pWait(30);

  const pClickAway = async (editor: Editor, path: number[], offset: number) => {
    editor.focus();
    TinySelections.setCursor(editor, path, offset);
    Mouse.trueClick(TinyDom.body(editor));
    await Waiter.pTryUntil(
      'Wait for dialog to disappear after nodeChange',
      () => UiFinder.notExists(SugarBody.body(), '.tox-pop')
    );
  };

  it('TBA: Moving selection away from the context toolbar predicate should make it disappear', async () => {
    const editor = hook.editor();
    editor.setContent('<p>One <a href="http://tiny.cloud">link</a> Two</p>');
    // Need to wait a little before checking the context toolbar isn't shown,
    // since we don't have anything we can wait for a change in
    await Waiter.pWait(100);
    UiFinder.notExists(SugarBody.body(), '.tox-pop');
    TinySelections.setCursor(editor, [ 0, 1, 0 ], 'L'.length);
    editor.focus();
    await UiFinder.pWaitForVisible('Waiting for toolbar', SugarBody.body(), '.tox-pop');
    await pClickAway(editor, [ 0, 0 ], 'O'.length);
  });

  context('subtoolbars', () => {
    const pWaitForToolbarState = async (index: number) => {
      if (index === 4) {
        await UiFinder.pWaitFor(`Waiting for last toolbar`, SugarBody.body(), `.tox-pop .tox-tbtn[data-mce-name="alpha"]:last-child`);
      } else {
        await UiFinder.pWaitFor(`Waiting for toolbar${index}`, SugarBody.body(), `.tox-pop .tox-tbtn[data-mce-name="test-subtoolbar${index}"]`);
      }

      UiFinder.notExists(SugarBody.body(), `.tox-tbtn[data-mce-name="test-subtoolbar${index - 1}"]`);
      UiFinder.notExists(SugarBody.body(), `.tox-tbtn[data-mce-name="test-subtoolbar${index + 1}"]`);
    };

    const pNavigateDownInToolbarByMouse = async (index: number) => {
      Mouse.clickOn(SugarBody.body(), `.tox-tbtn[data-mce-name="test-subtoolbar${index}"]`);
      await pWaitForToolbarState(index + 1);
      FocusTools.isOnSelector('Should remain editor iframe', SugarDocument.getDocument(), 'iframe');
    };

    const pNavigateBackByMouse = async (index: number) => {
      Mouse.clickOn(SugarBody.body(), '.tox-tbtn[aria-label="Back"]');

      const indexAfter = index - 1;

      await pWaitForToolbarState(indexAfter);

      if (indexAfter === 1) {
        UiFinder.notExists(SugarBody.body(), '.tox-tbtn[aria-label="Back"]');
      }

      FocusTools.isOnSelector('Should remain editor iframe', SugarDocument.getDocument(), 'iframe');
    };

    const pNavigateDownInToolbarByKeyboard = async (index: number) => {
      if (index === 1) {
        Keyboard.activeKeystroke(SugarDocument.getDocument(), Keys.right());
      } else {
        Keyboard.activeKeystroke(SugarDocument.getDocument(), Keys.right());
        Keyboard.activeKeystroke(SugarDocument.getDocument(), Keys.right());
      }

      Keyboard.activeKeystroke(SugarDocument.getDocument(), Keys.enter());

      const indexAfter = index + 1;

      await pWaitForToolbarState(indexAfter);

      FocusTools.isOnSelector(
        `Should move focus to back button on toolbar ${indexAfter}`,
        SugarDocument.getDocument(),
        '.tox-tbtn[aria-label="Back"]'
      );
    };

    const pNavigateBackByKeyboard = async (index: number) => {
      Keyboard.activeKeystroke(SugarDocument.getDocument(), Keys.left());
      Keyboard.activeKeystroke(SugarDocument.getDocument(), Keys.left());
      Keyboard.activeKeystroke(SugarDocument.getDocument(), Keys.enter());

      const indexAfter = index - 1;

      await pWaitForToolbarState(indexAfter);

      if (indexAfter === 1) {
        UiFinder.notExists(SugarBody.body(), '.tox-tbtn[aria-label="Back"]');
      }

      FocusTools.isOnSelector(
        `Should retain focus to subtoolbar button ${indexAfter}`,
        SugarDocument.getDocument(),
        `.tox-pop .tox-tbtn[data-mce-name="test-subtoolbar${indexAfter}"]`
      );
    };

    const pTestActionKeyOnButton = async (key: number) => {
      const editor = hook.editor();

      editor.setContent('<p>One <a href="http://tiny.cloud">link</a> Two</p>');
      TinySelections.setCursor(editor, [ 0, 1, 0 ], 'l'.length);
      await UiFinder.pWaitFor('Waiting for toolbar', SugarBody.body(), '.tox-pop');

      FocusTools.setFocus(SugarDocument.getDocument(), '.tox-tbtn[data-mce-name="alpha"]');
      await pNavigateDownInToolbarByKeyboard(1);

      Keyboard.activeKeystroke(SugarDocument.getDocument(), Keys.right());
      Keyboard.activeKeydown(SugarDocument.getDocument(), key);

      // Fake a command
      editor.focus();
      editor.nodeChanged();

      Keyboard.keyup(Keys.enter(), {}, TinyDom.body(editor));
      await pWaitForContextToolbarDebounce();

      await pWaitForToolbarState(2); // Should still be in the subtoolbar
      await pClickAway(editor, [ 0, 0 ], 'O'.length);
    };

    it('TINY-11748: Launch button should be able to navigate to a context toolbars and navigateback', async () => {
      const editor = hook.editor();

      editor.setContent('<p>One <a href="http://tiny.cloud">link</a> Two</p>');
      TinySelections.setCursor(editor, [ 0, 1, 0 ], 'l'.length);

      await UiFinder.pWaitFor('Waiting for toolbar', SugarBody.body(), '.tox-pop');

      for (let i = 1; i < 4; i++) {
        await pNavigateDownInToolbarByMouse(i);
      }

      for (let i = 4; i >= 2; i--) {
        await pNavigateBackByMouse(i);
      }
    });

    it('TINY-11748: Launch button should be able to navigate to a context toolbars and navigateback and retain toolbar focus', async () => {
      const editor = hook.editor();

      editor.setContent('<p>One <a href="http://tiny.cloud">link</a> Two</p>');
      TinySelections.setCursor(editor, [ 0, 1, 0 ], 'l'.length);

      await UiFinder.pWaitFor('Waiting for toolbar', SugarBody.body(), '.tox-pop');
      FocusTools.setFocus(SugarDocument.getDocument(), '.tox-tbtn[data-mce-name="alpha"]');

      for (let i = 1; i < 4; i++) {
        await pNavigateDownInToolbarByKeyboard(i);
      }

      for (let i = 4; i >= 2; i--) {
        await pNavigateBackByKeyboard(i);
      }

      await pClickAway(editor, [ 0, 0 ], 'O'.length);
    });

    it('TINY-11748: nodeChange subtoolbar reposition', async () => {
      const editor = hook.editor();

      editor.setContent('<p>One <a href="http://tiny.cloud">link</a> Two</p>');
      TinySelections.setCursor(editor, [ 0, 1, 0 ], 'l'.length);
      const toolbarEl = await UiFinder.pWaitFor('Waiting for toolbar', SugarBody.body(), '.tox-pop');

      await pNavigateDownInToolbarByMouse(1);

      const paragraph = UiFinder.findIn(TinyDom.body(editor), 'p').getOrDie();
      const beforeChangeLeftPos = toolbarEl.dom.getBoundingClientRect().left;

      Css.set(paragraph, 'text-align', 'right');
      editor.nodeChanged();

      await Waiter.pTryUntil('Waited for position to change', () => {
        const afterChangeLeftPos = toolbarEl.dom.getBoundingClientRect().left;
        assert.isAbove(afterChangeLeftPos, beforeChangeLeftPos, 'Should have repositioned the toolbar');
      });

      await pWaitForToolbarState(2); // Should still be in the subtoolbar
      await pClickAway(editor, [ 0, 0 ], 'O'.length);
    });

    it('TINY-11748: Should not re-render on focus shift to editor when subtoolbar is showing', async () => {
      const editor = hook.editor();

      editor.setContent('<p>One <a href="http://tiny.cloud">link</a> Two</p>');
      TinySelections.setCursor(editor, [ 0, 1, 0 ], 'l'.length);
      await UiFinder.pWaitFor('Waiting for toolbar', SugarBody.body(), '.tox-pop');

      FocusTools.setFocus(SugarDocument.getDocument(), '.tox-tbtn[data-mce-name="alpha"]');
      await pNavigateDownInToolbarByKeyboard(1);
      editor.focus();
      await pWaitForContextToolbarDebounce();
      await pWaitForContextToolbarDebounce();
      await pWaitForToolbarState(2); // Should still be in the subtoolbar
      await pClickAway(editor, [ 0, 0 ], 'O'.length);
    });

    it('TINY-11748: Using enter to press buttons should not close the subtoolbar', async () => pTestActionKeyOnButton(Keys.enter()));

    it('TINY-11748: Using space to press buttons should not close the subtoolbar', async () => pTestActionKeyOnButton(Keys.space()));
  });
});
