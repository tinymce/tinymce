import { UiFinder, Waiter } from '@ephox/agar';
import { after, describe, it } from '@ephox/bedrock-client';
import { Fun } from '@ephox/katamari';
import { TinyHooks, TinyUiActions } from '@ephox/mcagar';
import { SugarBody } from '@ephox/sugar';
import { assert } from 'chai';
import Editor from 'tinymce/core/api/Editor';
import Theme from 'tinymce/themes/silver/Theme';

const pWaitForThrobber = async (): Promise<void> => {
  await UiFinder.pWaitForVisible('waiting for throbber to open', SugarBody.body(), '.tox-throbber');
};

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

  after(() => {
    hook.editor().setProgressState(false);
  });

  it('cancels all open notifications when it opens', async () => {
    const editor = hook.editor();
    editor.notificationManager.open({
      type: 'success',
      text: 'lorem ipsum'
    });

    editor.setProgressState(true);
    await pWaitForThrobber();

    assert.isEmpty(editor.notificationManager.getNotifications(), 'No notifications should be open');
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

  it('does not close things until the throbber actually opens', async () => {
    const editor = hook.editor();
    editor.notificationManager.open({
      type: 'success',
      text: 'lorem ipsum'
    });

    // Note: this will cook in the background while we run the next little bit of code
    editor.setProgressState(true, 300);

    await Waiter.pWait(150);
    assert.isNotEmpty(editor.notificationManager.getNotifications(), 'The notification should not be closed yet');

    // Wait for the background task to finish
    await pWaitForThrobber();

    assert.isEmpty(editor.notificationManager.getNotifications(), 'The notification should be closed now');
  });
});