import { Log, Pipeline } from '@ephox/agar';
import { UnitTest } from '@ephox/bedrock-client';
import { LegacyUnit, TinyLoader } from '@ephox/mcagar';
import { Focus, SugarElement } from '@ephox/sugar';
import Editor from 'tinymce/core/api/Editor';
import { NotificationSpec } from 'tinymce/core/api/NotificationManager';
import Delay from 'tinymce/core/api/util/Delay';
import Tools from 'tinymce/core/api/util/Tools';
import Theme from 'tinymce/themes/silver/Theme';

UnitTest.asynctest('browser.tinymce.core.NotificationManagerTest', function (success, failure) {
  Theme();

  const suite = LegacyUnit.createSuite<Editor>();
  let beforeOpenEvents = [];
  let openEvents = [];

  const teardown = function (editor: Editor) {
    const notifications = [].concat(editor.notificationManager.getNotifications());

    Tools.each(notifications, function (notification) {
      notification.close();
    });

    beforeOpenEvents = [];
    openEvents = [];
  };

  // IMPORTANT: This test must be first, as it asserts the service message on load
  suite.test('TINY-6528: Notification manager should not fire BeforeOpenNotification for service messages', (editor) => {
    const notifications = editor.notificationManager.getNotifications();
    LegacyUnit.equal(beforeOpenEvents.length, 0, 'BeforeOpenNotification should not fire for service messages');
    LegacyUnit.equal(notifications.length, 1, 'Should add notification');
    LegacyUnit.equal(openEvents.length, 1, 'Should fire OpenNotification event');

    // Notification should be unmodified
    const unmodified = notifications[0].settings;
    LegacyUnit.equal(unmodified.text, 'service notification text', 'Should have unmodified text');
    LegacyUnit.equal(unmodified.type, 'warning', 'Should have unmodified type');
    LegacyUnit.equal(unmodified.timeout, 0, 'Should have unmodified timeout');

    teardown(editor);
  });

  suite.test('TestCase-TBA: Should not add duplicate text message', function (editor) {
    const testMsg1: NotificationSpec = { type: 'success', text: 'test success message' };
    const testMsg2: NotificationSpec = { type: 'warning', text: 'test warning message' };
    const testMsg3: NotificationSpec = { type: 'error', text: 'test error message' };
    const testMsg4: NotificationSpec = { type: 'info', text: 'test info message' };
    const notifications = editor.notificationManager.getNotifications();

    editor.notificationManager.open(testMsg1);

    LegacyUnit.equal(notifications.length, 1, 'Should have one message after one added.');
    LegacyUnit.equal(openEvents.length, 1, 'Should have one OpenNotification event.');

    editor.notificationManager.open(testMsg1);

    LegacyUnit.equal(notifications.length, 1, 'Should not add message if duplicate.');
    LegacyUnit.equal(openEvents.length, 1, 'Should not fire additional OpenNotification for duplicate.');

    editor.notificationManager.open(testMsg2);
    editor.notificationManager.open(testMsg3);
    editor.notificationManager.open(testMsg4);

    LegacyUnit.equal(notifications.length, 4, 'Non duplicate messages should get added.');
    LegacyUnit.equal(openEvents.length, 4, 'Should fire additional OpenNotification events for notifications.');

    editor.notificationManager.open(testMsg2);
    editor.notificationManager.open(testMsg3);
    editor.notificationManager.open(testMsg4);

    LegacyUnit.equal(notifications.length, 4, 'Should work for all text message types.');

    teardown(editor);
  });

  suite.test('TestCase-TBA: Should add duplicate progressBar messages', function (editor) {
    const testMsg1: NotificationSpec = { text: 'test progressBar message', progressBar: true };
    const notifications = editor.notificationManager.getNotifications();

    editor.notificationManager.open(testMsg1);

    LegacyUnit.equal(notifications.length, 1, 'Should have one message after one added.');

    editor.notificationManager.open(testMsg1);
    editor.notificationManager.open(testMsg1);
    editor.notificationManager.open(testMsg1);

    LegacyUnit.equal(notifications.length, 4, 'Duplicate should be added for progressBar message.');

    teardown(editor);
  });

  suite.asyncTest('TestCase-TBA: Should add duplicate timeout messages', function (editor, done) {

    const checkClosed = function () {
      if (notifications.length === 0) {
        done();
        teardown(editor);
      }
    };
    const testMsg1: NotificationSpec = { text: 'test timeout message', timeout: 1 };
    const notifications = editor.notificationManager.getNotifications();

    editor.notificationManager.open(testMsg1);

    LegacyUnit.equal(notifications.length, 1, 'Should have one message after one added.');

    editor.notificationManager.open(testMsg1);

    LegacyUnit.equal(notifications.length, 2, 'Duplicate should be added for timeout message.');

    Delay.setTimeout(() => {
      checkClosed();
    }, 100);
  });

  suite.test('TestCase-TINY-6058: Should move focus back to the editor when all notifications closed', function (editor) {
    const testMsg1: NotificationSpec = { type: 'warning', text: 'test message 1' };
    const testMsg2: NotificationSpec = { type: 'error', text: 'test message 2' };
    const notifications = editor.notificationManager.getNotifications();

    const n1 = editor.notificationManager.open(testMsg1);
    const n2 = editor.notificationManager.open(testMsg2);
    LegacyUnit.equal(notifications.length, 2, 'Should have two messages added.');

    const hasFocus = (node: Node) => Focus.search(SugarElement.fromDom(node)).isSome();

    Focus.focus(SugarElement.fromDom(n2.getEl()));
    LegacyUnit.equal(true, hasFocus(n2.getEl()), 'Focus should be on notification 2');

    n2.close();
    LegacyUnit.equal(true, hasFocus(n1.getEl()), 'Focus should be on notification 1');

    n1.close();
    LegacyUnit.equal(true, editor.hasFocus(), 'Focus should be on the editor');

    teardown(editor);
  });

  suite.test('TINY-6528: Notification manager should throw events for notification modification', (editor) => {
    const testMsg: NotificationSpec = {
      type: 'warning',
      text: 'unmodified notification text',
      icon: 'warning',
      progressBar: true,
      timeout: 10,
      closeButton: true
    };
    const notifications = editor.notificationManager.getNotifications();

    // Unmodified notification
    editor.notificationManager.open(testMsg);
    LegacyUnit.equal(notifications.length, 1, 'Should add notification');
    LegacyUnit.deepEqual(notifications[0].settings, testMsg, 'Entire notification should be unmodified');
    teardown(editor);

    editor.on('BeforeOpenNotification', (event) => {
      event.notification.type = 'success';
      event.notification.text = 'Modified notification text';
      event.notification.icon = 'user';
      event.notification.progressBar = false;
      event.notification.timeout = 5;
      event.notification.closeButton = false;
    });

    editor.notificationManager.open(testMsg);
    LegacyUnit.equal(openEvents.length, 1, 'Should fire OpenNotification event');
    LegacyUnit.equal(notifications.length, 1, 'Should add notification');

    // Modified notification
    const modified = notifications[0].settings;
    LegacyUnit.equal(modified.text, 'Modified notification text', 'Should have modified text');
    LegacyUnit.equal(modified.type, 'success', 'Should have modified type');
    LegacyUnit.equal(modified.icon, 'user', 'Should have modified icon');
    LegacyUnit.equal(modified.progressBar, false, 'Should have modified progressBar');
    LegacyUnit.equal(modified.timeout, 5, 'Should have modified timeout');
    LegacyUnit.equal(modified.closeButton, false, 'Should have modified closeButton');
    teardown(editor);
  });

  suite.test('TestCase-TBA: Should not open notification if editor is removed', function (editor) {
    const testMsg1: NotificationSpec = { type: 'warning', text: 'test progressBar message' };

    editor.remove();

    try {
      editor.notificationManager.open(testMsg1);
      LegacyUnit.equal(true, true, 'Should execute without throwing.');
    } catch (e) {
      LegacyUnit.equal(true, false, 'Should never throw exception.');
    }

    teardown(editor);
  });

  TinyLoader.setupInBodyAndShadowRoot(function (editor, onSuccess, onFailure) {
    Pipeline.async({}, Log.steps('TBA', 'Testing the notifications api', suite.toSteps(editor)), onSuccess, onFailure);
  }, {
    service_message: 'service notification text',
    add_unload_trigger: false,
    disable_nodechange: true,
    theme: 'silver',
    indent: false,
    entities: 'raw',
    base_url: '/project/tinymce/js/tinymce',
    setup: (editor) => {
      editor.on('BeforeOpenNotification', (event) => beforeOpenEvents.push(event));
      editor.on('OpenNotification', (event) => openEvents.push(event));
    }
  }, success, failure);
});
