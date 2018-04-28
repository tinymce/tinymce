import { Pipeline } from '@ephox/agar';
import { LegacyUnit, TinyLoader } from '@ephox/mcagar';
import Tools from 'tinymce/core/api/util/Tools';
import Theme from 'tinymce/themes/modern/Theme';
import { UnitTest } from '@ephox/bedrock';

UnitTest.asynctest('browser.tinymce.core.NotificationManagerTest', function () {
  const success = arguments[arguments.length - 2];
  const failure = arguments[arguments.length - 1];
  const suite = LegacyUnit.createSuite();

  Theme();

  const teardown = function (editor) {
    const notifications = [].concat(editor.notificationManager.getNotifications());

    Tools.each(notifications, function (notification) {
      notification.close();
    });
  };

  suite.test('Should not add duplicate text message', function (editor) {
    const testMsg1 = { type: 'default', text: 'test default message' };
    const testMsg2 = { type: 'warning', text: 'test warning message' };
    const testMsg3 = { type: 'error', text: 'test error message' };
    const testMsg4 = { type: 'info', text: 'test info message' };
    const notifications = editor.notificationManager.getNotifications();

    editor.notificationManager.open(testMsg1);

    LegacyUnit.equal(notifications.length, 1, 'Should have one message after one added.');

    editor.notificationManager.open(testMsg1);

    LegacyUnit.equal(notifications.length, 1, 'Should not add message if duplicate.');

    editor.notificationManager.open(testMsg2);
    editor.notificationManager.open(testMsg3);
    editor.notificationManager.open(testMsg4);

    LegacyUnit.equal(notifications.length, 4, 'Non duplicate messages should get added.');

    editor.notificationManager.open(testMsg2);
    editor.notificationManager.open(testMsg3);
    editor.notificationManager.open(testMsg4);

    LegacyUnit.equal(notifications.length, 4, 'Should work for all text message types.');

    teardown(editor);
  });

  suite.test('Should add duplicate progressBar messages', function (editor) {
    const testMsg1 = { text: 'test progressBar message', progressBar: true };
    const notifications = editor.notificationManager.getNotifications();

    editor.notificationManager.open(testMsg1);

    LegacyUnit.equal(notifications.length, 1, 'Should have one message after one added.');

    editor.notificationManager.open(testMsg1);
    editor.notificationManager.open(testMsg1);
    editor.notificationManager.open(testMsg1);

    LegacyUnit.equal(notifications.length, 4, 'Duplicate should be added for progressBar message.');

    teardown(editor);
  });

  suite.asyncTest('Should add duplicate timeout messages', function (editor, done) {
    const checkClosed = function () {
      if (notifications.length === 0) {
        done();
        teardown(editor);
      }
    };
    const testMsg1 = { text: 'test timeout message', timeout: 1 };
    const notifications = editor.notificationManager.getNotifications();

    editor.notificationManager.open(testMsg1).on('close', checkClosed);

    LegacyUnit.equal(notifications.length, 1, 'Should have one message after one added.');

    editor.notificationManager.open(testMsg1).on('close', checkClosed);

    LegacyUnit.equal(notifications.length, 2, 'Duplicate should be added for timeout message.');
  });

  suite.test('Should not open notifcation if editor is removed', function (editor) {
    const testMsg1 = { type: 'default', text: 'test progressBar message' };

    editor.remove();

    try {
      editor.notificationManager.open(testMsg1);
      LegacyUnit.equal(true, true, 'Should execute without throwing.');
    } catch (e) {
      LegacyUnit.equal(true, false, 'Should never throw exception.');
    }

    teardown(editor);
  });

  TinyLoader.setup(function (editor, onSuccess, onFailure) {
    Pipeline.async({}, suite.toSteps(editor), onSuccess, onFailure);
  }, {
    add_unload_trigger: false,
    disable_nodechange: true,
    indent: false,
    entities: 'raw',
    skin_url: '/project/js/tinymce/skins/lightgray'
  }, success, failure);
});
