import { UiFinder, Waiter } from '@ephox/agar';
import { afterEach, describe, it } from '@ephox/bedrock-client';
import { Fun } from '@ephox/katamari';
import { TinyHooks, TinyUiActions } from '@ephox/mcagar';
import { Class, SugarBody, SugarElement, SugarNode } from '@ephox/sugar';

import Editor from 'tinymce/core/api/Editor';
import Theme from 'tinymce/themes/silver/Theme';

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
  }, [ Theme ]);

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

  it('closes the context toolbar on popup', async () => {
    const editor = hook.editor();
    editor.setContent('<p class="ctx-menu-me">Hello World</p>');

    await Waiter.pTryUntil('Waiting for context toolbar to open', () => {
      UiFinder.findIn(SugarBody.body(), '.tox-pop');
    });

    editor.setProgressState(true);
    await pWaitForThrobber();

    await Waiter.pTryUntil('context toolbar is closed', () => {
      UiFinder.notExists(SugarBody.body(), '.tox-pop');
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