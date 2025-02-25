import { FocusTools, Keyboard, Keys, Mouse, TestStore, UiFinder, Waiter } from '@ephox/agar';
import { context, describe, it } from '@ephox/bedrock-client';
import { SugarBody, SugarDocument } from '@ephox/sugar';
import { TinyContentActions, TinyHooks, TinySelections } from '@ephox/wrap-mcagar';

import Editor from 'tinymce/core/api/Editor';

describe('browser.tinymce.themes.silver.editor.contexttoolbar.ContextToolbarTest', () => {
  const store = TestStore();
  const hook = TinyHooks.bddSetupLight<Editor>({
    base_url: '/project/tinymce/js/tinymce',
    toolbar: 'bold',
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
    // NOTE: This internally fires a nodeChange
    TinySelections.setCursor(editor, [ 0, 0 ], 'O'.length);
    await Waiter.pTryUntil(
      'Wait for dialog to disappear after nodeChange',
      () => UiFinder.notExists(SugarBody.body(), '.tox-pop')
    );
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
    });

    it('TINY-11889: Toolbar should not close if you re-focus the editor', async () => {
      const editor = hook.editor();

      editor.setContent('<p>One <a href="http://tiny.cloud">link</a> Two</p>');
      TinySelections.setCursor(editor, [ 0, 1, 0 ], 'l'.length);

      await UiFinder.pWaitFor('Waiting for toolbar', SugarBody.body(), '.tox-pop');
      FocusTools.setFocus(SugarDocument.getDocument(), '.tox-tbtn[data-mce-name="alpha"]');

      editor.focus();
      await Waiter.pWait(100); // Needs to be longer than the thottler of 17ms

      await UiFinder.pWaitFor('Toolbar should still be available on re-focus', SugarBody.body(), '.tox-pop');
    });

    it('TINY-11889: Toolbar should close if you press escape when it has focus', async () => {
      const editor = hook.editor();

      editor.setContent('<p>One <a href="http://tiny.cloud">link</a> Two</p>');
      TinySelections.setCursor(editor, [ 0, 1, 0 ], 'l'.length);

      await UiFinder.pWaitFor('Waiting for toolbar', SugarBody.body(), '.tox-pop');
      FocusTools.setFocus(SugarDocument.getDocument(), '.tox-tbtn[data-mce-name="alpha"]');
      Keyboard.activeKeystroke(SugarDocument.getDocument(), Keys.escape());
      UiFinder.notExists(SugarBody.body(), '.tox-pop');
    });

    it('TINY-11889: Toolbar should close if you press escape when editor has focus', async () => {
      const editor = hook.editor();

      editor.setContent('<p>One <a href="http://tiny.cloud">link</a> Two</p>');
      TinySelections.setCursor(editor, [ 0, 1, 0 ], 'l'.length);

      await UiFinder.pWaitFor('Waiting for toolbar', SugarBody.body(), '.tox-pop');

      editor.focus();
      TinyContentActions.keystroke(editor, Keys.escape());
      UiFinder.notExists(SugarBody.body(), '.tox-pop');
    });

    it('TINY-11889: Toolbar should close if you open a dialog', async () => {
      const editor = hook.editor();

      editor.setContent('<p>One <a href="http://tiny.cloud">link</a> Two</p>');
      TinySelections.setCursor(editor, [ 0, 1, 0 ], 'l'.length);

      await UiFinder.pWaitFor('Waiting for toolbar', SugarBody.body(), '.tox-pop');
      editor.dispatch('OpenWindow');
      UiFinder.notExists(SugarBody.body(), '.tox-pop');
    });

    it('TINY-11889: Toolbar should close if we move focus to toolbar', async () => {
      const editor = hook.editor();

      editor.setContent('<p>One <a href="http://tiny.cloud">link</a> Two</p>');
      TinySelections.setCursor(editor, [ 0, 1, 0 ], 'l'.length);

      await UiFinder.pWaitFor('Waiting for toolbar', SugarBody.body(), '.tox-pop');
      FocusTools.setFocus(SugarDocument.getDocument(), '.tox-tbtn[data-mce-name="bold"]');
      await Waiter.pWait(10); // Wait for the 0ms focus event out delay
      UiFinder.notExists(SugarBody.body(), '.tox-pop');
    });
  });
});
