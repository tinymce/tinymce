import { UiFinder, Waiter } from '@ephox/agar';
import { afterEach, beforeEach, context, describe, it } from '@ephox/bedrock-client';
import { Fun } from '@ephox/katamari';
import { Class, Focus, Insert, Remove, SugarBody, SugarElement, SugarNode } from '@ephox/sugar';
import { TinyHooks, TinyUiActions } from '@ephox/wrap-mcagar';

import Editor from 'tinymce/core/api/Editor';

describe('browser.tinymce.themes.silver.throbber.ThrobberPopupTest', () => {
  const hook = TinyHooks.bddSetup<Editor>({
    base_url: '/project/tinymce/js/tinymce',
    setup: (ed: Editor) => {
      ed.ui.registry.addMenuItem('test-item', {
        icon: 'nope',
        text: 'do the thing',
        onAction: Fun.die('please do not click this')
      });
      ed.ui.registry.addContextMenu('test', {
        update: Fun.constant('test-item')
      });
      ed.ui.registry.addContextToolbar('test-2', {
        items: 'bold | italic',
        scope: 'node',
        position: 'selection',
        predicate: (n: Node) => {
          const node = SugarElement.fromDom(n);
          return SugarNode.isHTMLElement(node) && Class.has(node, 'ctx-menu-me');
        }
      });
    },
    contextmenu: 'test'
  }, [], true);

  const pWaitForThrobber = () =>
    UiFinder.pWaitForVisible('waiting for throbber to open', SugarBody.body(), '.tox-throbber');

  afterEach(() => {
    hook.editor().setProgressState(false);
  });

  it('closes the context menu when it opens', async () => {
    const editor = hook.editor();
    editor.setContent('<p>Hello world</p>');
    await TinyUiActions.pTriggerContextMenu(editor, 'p', '.tox-menu');

    editor.setProgressState(true);
    await pWaitForThrobber();

    await Waiter.pTryUntil('context menu is closed', () => {
      UiFinder.notExists(SugarBody.body(), '.tox-menu');
    });
  });

  context('context toolbar', () => {
    beforeEach(async () => {
      const editor = hook.editor();
      editor.setContent('<p class="ctx-menu-me">Hello World</p>');

      await Waiter.pTryUntil('Waiting for context toolbar to open', () => {
        UiFinder.findIn(SugarBody.body(), '.tox-pop');
      });

      editor.setProgressState(true);
      await pWaitForThrobber();
    });

    it('closed by throbber opening', async () => {
      await Waiter.pTryUntil('context toolbar is closed', () => {
        UiFinder.notExists(SugarBody.body(), '.tox-pop');
      });
    });

    it('re-opens when the throbber closes', async () => {
      const editor = hook.editor();
      editor.setProgressState(false);
      await Waiter.pTryUntil('context toolbar is open again', () => {
        UiFinder.exists(SugarBody.body(), '.tox-pop');
      });
    });

    it('does not re-open when the throbber closes - if there is no focus on the editor', async () => {
      // blur the editor
      const input = SugarElement.fromTag('input');
      Insert.append(SugarBody.body(), input);
      Focus.focus(input);

      // close the throbber
      const editor = hook.editor();
      editor.setProgressState(false);
      await UiFinder.pWaitForHidden('throbber is closed', SugarBody.body(), '.tox-throbber');
      // give the context toolbar time to re-open (note: it should not re-open during this time)
      await Waiter.pWait(50);

      // ensure that the context toolbar does not re-open
      UiFinder.notExists(SugarBody.body(), '.tox-pop');

      // clean up
      Remove.remove(input);
    });
  });

  it('does not close things until the throbber actually opens', async () => {
    const editor = hook.editor();
    await TinyUiActions.pTriggerContextMenu(editor, 'p', '.tox-menu');

    // Note: this will cook in the background while we run the next little bit of code
    editor.setProgressState(true, 300);

    await Waiter.pWait(150);
    await Waiter.pTryUntil('context menu should not be closed yet', () => {
      UiFinder.exists(SugarBody.body(), '.tox-menu');
    });

    // Wait for the background task to finish
    await pWaitForThrobber();

    await Waiter.pTryUntil('context menu should now be closed closed', () => {
      UiFinder.notExists(SugarBody.body(), '.tox-menu');
    });
  });
});
