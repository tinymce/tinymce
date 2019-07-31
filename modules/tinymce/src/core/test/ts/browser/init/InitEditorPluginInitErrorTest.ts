import { Assertions, Log, Pipeline, Step } from '@ephox/agar';
import { TinyApis, TinyLoader } from '@ephox/mcagar';
import { UnitTest } from '@ephox/bedrock';

import Theme from 'tinymce/themes/silver/Theme';
import PluginManager from 'tinymce/core/api/PluginManager';

UnitTest.asynctest('browser.tinymce.core.init.InitEditorPluginInitErrorTest', (success, failure) => {
  Theme();

  PluginManager.add('errorplugin', () => {
    throw new Error('Failed to initialize plugin');
  });

  TinyLoader.setupLight(function (editor, onSuccess, onFailure) {
    const tinyApis = TinyApis(editor);

    Pipeline.async({}, [
      Log.stepsAsStep('TBA', 'Editor is responsive after using a plugin that throws an error during init', [
        tinyApis.sSetContent('<p>a</p>'),
        tinyApis.sAssertContent('<p>a</p>'),
      ]),
      Log.step('TBA', 'Failed plugin shouldn\'t be registered', Step.sync(() => {
        Assertions.assertEq('Plugin shouldn\'t be registered', undefined, editor.plugins.errorplugin);
      })),
      Log.step('TBA', 'Notification opened detailing plugin failed to init', Step.sync(() => {
        const notifications = editor.notificationManager.getNotifications();
        Assertions.assertEq('Notification should exist', 1, notifications.length);
        const notification = notifications[0];
        Assertions.assertEq('Notification should have a message', 'Failed to initialize plugin: errorplugin', notification.settings.text);
        Assertions.assertEq('Notification should be an error', 'error', notification.settings.type);
        notification.close();
      }))
    ], onSuccess, onFailure);
  }, {
    base_url: '/project/tinymce/js/tinymce',
    plugins: 'errorplugin'
  }, success, failure);
});
