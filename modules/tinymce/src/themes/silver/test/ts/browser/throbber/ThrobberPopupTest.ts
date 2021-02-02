import { UiFinder, Waiter } from '@ephox/agar';
import { describe, it } from '@ephox/bedrock-client';
import { Fun } from '@ephox/katamari';
import { SugarBody } from '@ephox/sugar';
import { assert } from 'chai';
import { TinyHooks, TinyUiActions } from '@ephox/mcagar';
import Editor from 'tinymce/core/api/Editor';
import Theme from 'tinymce/themes/silver/Theme';

const openThrobber = async (editor: Editor, delay?: number): Promise<void> => {
  editor.setProgressState(true, delay);
  await new Promise((resolve) => setTimeout(resolve, delay));
  await UiFinder.pWaitForVisible('throbber to open', SugarBody.body(), '.tox-throbber');
}

describe('browser.tinymce.themes.silver.throbber.ThrobberPopupTest', () => {
  const hook = TinyHooks.bddSetup<Editor>({
    theme: 'silver',
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
    },
    contextmenu: 'test'
  }, [ Theme ]);

  it('cancels all open notifications when it opens', async () => {
    const ed = hook.editor();
    ed.notificationManager.open({
      type: 'success',
      text: 'lorem ipsum'
    });

    await openThrobber(ed);

    assert.isEmpty(ed.notificationManager.getNotifications(), 'No notifications should be open');
    ed.setProgressState(false);
  });

  it('closes the context menu when it opens', async () => {
    const ed = hook.editor();
    ed.setContent('<p>Hello world</p>');
    await TinyUiActions.pTriggerContextMenu(ed, 'p', '.tox-menu');

    await openThrobber(ed);

    await Waiter.pTryUntil('context menu is closed', () => {
      UiFinder.notExists(SugarBody.body(), '.tox-menu');
    });
    ed.setProgressState(false);
  });

  it('does not close things until the throbber actually opens', async () => {
    const ed = hook.editor();
    ed.notificationManager.open({
      type: 'success',
      text: 'lorem ipsum'
    });

    const doTheClose = openThrobber(ed, 300);
    const assertInParallel = async () => {
      await new Promise((resolve) => setTimeout(resolve, 150));
      assert.isNotEmpty(ed.notificationManager.getNotifications(), 'The notification should not be closed yet');
    };

    await Promise.all([ doTheClose, assertInParallel() ]);

    assert.isEmpty(ed.notificationManager.getNotifications(), 'The notification should now be closed');
    ed.setProgressState(false);
  });
});