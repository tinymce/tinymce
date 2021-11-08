import { before, describe, it } from '@ephox/bedrock-client';
import { TinyAssertions, TinyHooks } from '@ephox/wrap-mcagar';
import { assert } from 'chai';

import Editor from 'tinymce/core/api/Editor';
import PluginManager from 'tinymce/core/api/PluginManager';

import ErrorHelper from '../../module/test/ErrorHelpers';

describe('browser.tinymce.core.init.InitEditorPluginInitErrorTest', () => {
  const errorHelper = ErrorHelper();
  before(() => {
    PluginManager.add('errorplugin', () => {
      throw new Error('Failed to initialize plugin');
    });
  });

  const hook = TinyHooks.bddSetupLight<Editor>({
    base_url: '/project/tinymce/js/tinymce',
    plugins: 'errorplugin',
    setup: (editor: Editor) => {
      errorHelper.trackErrors(editor, 'PluginLoadError');
    }
  }, []);

  it('TBA: Editor is responsive after using a plugin that throws an error during init', () => {
    const editor = hook.editor();
    editor.setContent('<p>a</p>');
    TinyAssertions.assertContent(editor, '<p>a</p>');
  });

  it(`TBA: Failed plugin shouldn't be registered`, () => {
    const editor = hook.editor();
    assert.isUndefined(editor.plugins.errorplugin, `Plugin shouldn't be registered`);
  });

  it('TBA: Notification opened detailing plugin failed to init', () => {
    const editor = hook.editor();
    const notifications = editor.notificationManager.getNotifications();
    assert.lengthOf(notifications, 1, 'Notification should exist');
    const notification = notifications[0];
    assert.equal(notification.settings.text, 'Failed to initialize plugin: errorplugin', 'Notification should have a message');
    assert.equal(notification.settings.type, 'error', 'Notification should be an error');
    notification.close();
  });

  it('TBA: Plugin load error should be reported', () => {
    return errorHelper.pAssertErrorLogged('Error is reported', 'Failed to initialize plugin: errorplugin');
  });
});
