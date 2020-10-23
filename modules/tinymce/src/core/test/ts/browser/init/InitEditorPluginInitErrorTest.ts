import { Assertions, Log, Pipeline, Step } from '@ephox/agar';
import { UnitTest } from '@ephox/bedrock-client';
import { TinyApis, TinyLoader } from '@ephox/mcagar';
import PluginManager from 'tinymce/core/api/PluginManager';

import Theme from 'tinymce/themes/silver/Theme';
import ErrorHelper from '../../module/test/ErrorHelpers';

UnitTest.asynctest('browser.tinymce.core.init.InitEditorPluginInitErrorTest', (success, failure) => {
  Theme();

  const errorHelper = ErrorHelper();

  PluginManager.add('errorplugin', () => {
    throw new Error('Failed to initialize plugin');
  });

  TinyLoader.setupLight(function (editor, onSuccess, onFailure) {
    const tinyApis = TinyApis(editor);

    Pipeline.async({}, [
      Log.stepsAsStep('TBA', 'Editor is responsive after using a plugin that throws an error during init', [
        tinyApis.sSetContent('<p>a</p>'),
        tinyApis.sAssertContent('<p>a</p>')
      ]),
      Log.step('TBA', `Failed plugin shouldn't be registered`, Step.sync(() => {
        Assertions.assertEq(`Plugin shouldn't be registered`, undefined, editor.plugins.errorplugin);
      })),
      Log.step('TBA', 'Notification opened detailing plugin failed to init', Step.sync(() => {
        const notifications = editor.notificationManager.getNotifications();
        Assertions.assertEq('Notification should exist', 1, notifications.length);
        const notification = notifications[0];
        Assertions.assertEq('Notification should have a message', 'Failed to initialize plugin: errorplugin', notification.settings.text);
        Assertions.assertEq('Notification should be an error', 'error', notification.settings.type);
        notification.close();
      })),
      Log.step('TBA', 'Plugin load error should be reported', Step.sync(() => {
        errorHelper.sAssertErrorLogged('Error is reported', 'Failed to initialize plugin: errorplugin');
      }))
    ], onSuccess, onFailure);
  }, {
    base_url: '/project/tinymce/js/tinymce',
    plugins: 'errorplugin',
    setup: (editor) => errorHelper.trackErrors(editor, 'PluginLoadError')
  }, success, failure);
});
