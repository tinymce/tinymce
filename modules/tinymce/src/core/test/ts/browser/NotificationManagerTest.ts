import { Log, Pipeline } from '@ephox/agar';
import { UnitTest } from '@ephox/bedrock-client';
import { Node } from '@ephox/dom-globals';
import { LegacyUnit, TinyLoader } from '@ephox/mcagar';
import { Element, Focus } from '@ephox/sugar';
import Editor from 'tinymce/core/api/Editor';
import Delay from 'tinymce/core/api/util/Delay';
import Tools from 'tinymce/core/api/util/Tools';
import Theme from 'tinymce/themes/silver/Theme';
import { NotificationSpec } from 'tinymce/core/api/NotificationManager';

UnitTest.asynctest('browser.tinymce.core.NotificationManagerTest', function (success, failure) {
  Theme();

  const suite = LegacyUnit.createSuite<Editor>();

  const teardown = function (editor: Editor) {
    const notifications = [].concat(editor.notificationManager.getNotifications());

    Tools.each(notifications, function (notification) {
      notification.close();
    });
  };

  suite.test('TestCase-TBA: Should not add duplicate text message', function (editor) {
    const testMsg1: NotificationSpec = { type: 'success', text: 'test success message' };
    const testMsg2: NotificationSpec = { type: 'warning', text: 'test warning message' };
    const testMsg3: NotificationSpec = { type: 'error', text: 'test error message' };
    const testMsg4: NotificationSpec = { type: 'info', text: 'test info message' };
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

    const hasFocus = (node: Node) => Focus.search(Element.fromDom(node)).isSome();

    Focus.focus(Element.fromDom(n2.getEl()));
    LegacyUnit.equal(true, hasFocus(n2.getEl()), 'Focus should be on notification 2');

    n2.close();
    LegacyUnit.equal(true, hasFocus(n1.getEl()), 'Focus should be on notification 1');

    n1.close();
    LegacyUnit.equal(true, editor.hasFocus(), 'Focus should be on the editor');

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

  TinyLoader.setupLight(function (editor, onSuccess, onFailure) {
    Pipeline.async({}, Log.steps('TBA', 'Testing the notifications api', suite.toSteps(editor)), onSuccess, onFailure);
  }, {
    add_unload_trigger: false,
    disable_nodechange: true,
    theme: 'silver',
    indent: false,
    entities: 'raw',
    base_url: '/project/tinymce/js/tinymce'
  }, success, failure);
});
