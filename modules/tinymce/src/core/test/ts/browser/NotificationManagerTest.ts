import { afterEach, beforeEach, context, describe, it } from '@ephox/bedrock-client';
import { Arr } from '@ephox/katamari';
import { Focus, Insert, Remove, SugarElement } from '@ephox/sugar';
import { LegacyUnit, TinyHooks } from '@ephox/wrap-mcagar';
import { assert } from 'chai';

import Editor from 'tinymce/core/api/Editor';
import { BeforeOpenNotificationEvent, OpenNotificationEvent } from 'tinymce/core/api/EventTypes';
import { NotificationSpec } from 'tinymce/core/api/NotificationManager';

describe('browser.tinymce.core.NotificationManagerTest', () => {
  Arr.each([
    { label: 'Iframe Editor', setup: TinyHooks.bddSetup },
    { label: 'Shadow Dom Editor', setup: TinyHooks.bddSetupInShadowRoot }
  ], (tester) => {
    context(tester.label, () => {
      let beforeOpenEvents: BeforeOpenNotificationEvent[] = [];
      let openEvents: OpenNotificationEvent[] = [];
      const hook = tester.setup<Editor>({
        service_message: 'service notification text',
        add_unload_trigger: false,
        disable_nodechange: true,
        indent: false,
        entities: 'raw',
        base_url: '/project/tinymce/js/tinymce',
        setup: (editor: Editor) => {
          editor.on('BeforeOpenNotification', (event) => beforeOpenEvents.push(event));
          editor.on('OpenNotification', (event) => openEvents.push(event));
        }
      }, []);

      const resetNotifications = () => {
        const editor = hook.editor();
        const notifications = [ ...editor.notificationManager.getNotifications() ];
        Arr.each(notifications, (notification) => notification.close());
        beforeOpenEvents = [];
        openEvents = [];
      };

      afterEach(() => {
        resetNotifications();
      });

      // IMPORTANT: This test must be first, as it asserts the service message on load
      it('TINY-6528: Notification manager should not fire BeforeOpenNotification for service messages', () => {
        const editor = hook.editor();
        const notifications = editor.notificationManager.getNotifications();
        assert.lengthOf(beforeOpenEvents, 0, 'BeforeOpenNotification should not fire for service messages');
        assert.lengthOf(notifications, 1, 'Should add notification');
        assert.lengthOf(openEvents, 1, 'Should fire OpenNotification event');

        // Notification should be unmodified
        const unmodified = notifications[0].settings;
        assert.equal(unmodified.text, 'service notification text', 'Should have unmodified text');
        assert.equal(unmodified.type, 'warning', 'Should have unmodified type');
        assert.equal(unmodified.timeout, 0, 'Should have unmodified timeout');

        // Notification event should have "notification" field
        assert.property(openEvents[0], 'notification');
      });

      it('TBA: Should not add duplicate text message', () => {
        const editor = hook.editor();
        resetNotifications();

        const testMsg1: NotificationSpec = { type: 'success', text: 'test success message' };
        const testMsg2: NotificationSpec = { type: 'warning', text: 'test warning message' };
        const testMsg3: NotificationSpec = { type: 'error', text: 'test error message' };
        const testMsg4: NotificationSpec = { type: 'info', text: 'test info message' };
        const notifications = editor.notificationManager.getNotifications();

        editor.notificationManager.open(testMsg1);

        assert.lengthOf(notifications, 1, 'Should have one message after one added.');
        assert.lengthOf(openEvents, 1, 'Should have one OpenNotification event.');

        editor.notificationManager.open(testMsg1);

        LegacyUnit.equal(notifications.length, 1, 'Should not add message if duplicate.');
        assert.lengthOf(openEvents, 1, 'Should not fire additional OpenNotification for duplicate.');

        editor.notificationManager.open(testMsg2);
        editor.notificationManager.open(testMsg3);
        editor.notificationManager.open(testMsg4);

        assert.lengthOf(notifications, 4, 'Non duplicate messages should get added.');
        assert.lengthOf(openEvents, 4, 'Should fire additional OpenNotification events for notifications.');

        editor.notificationManager.open(testMsg2);
        editor.notificationManager.open(testMsg3);
        editor.notificationManager.open(testMsg4);

        assert.lengthOf(notifications, 4, 'Should work for all text message types.');
      });

      it('TBA: Should add duplicate progressBar messages', () => {
        const editor = hook.editor();
        resetNotifications();

        const testMsg1: NotificationSpec = { text: 'test progressBar message', progressBar: true };
        const notifications = editor.notificationManager.getNotifications();

        editor.notificationManager.open(testMsg1);

        assert.lengthOf(notifications, 1, 'Should have one message after one added.');

        editor.notificationManager.open(testMsg1);
        editor.notificationManager.open(testMsg1);
        editor.notificationManager.open(testMsg1);

        assert.lengthOf(notifications, 4, 'Duplicate should be added for progressBar message.');
      });

      it('TBA: Should add duplicate timeout messages', (done) => {
        const editor = hook.editor();
        resetNotifications();

        const checkClosed = () => {
          if (notifications.length === 0) {
            done();
          }
        };
        const testMsg1: NotificationSpec = { text: 'test timeout message', timeout: 1 };
        const notifications = editor.notificationManager.getNotifications();

        editor.notificationManager.open(testMsg1);

        assert.lengthOf(notifications, 1, 'Should have one message after one added.');

        editor.notificationManager.open(testMsg1);

        assert.lengthOf(notifications, 2, 'Duplicate should be added for timeout message.');

        setTimeout(() => {
          checkClosed();
        }, 100);
      });

      it('TINY-6058: Should move focus back to the editor when all notifications closed', () => {
        const editor = hook.editor();
        resetNotifications();

        const testMsg1: NotificationSpec = { type: 'warning', text: 'test message 1' };
        const testMsg2: NotificationSpec = { type: 'error', text: 'test message 2' };
        const notifications = editor.notificationManager.getNotifications();

        const n1 = editor.notificationManager.open(testMsg1);
        const n2 = editor.notificationManager.open(testMsg2);
        assert.lengthOf(notifications, 2, 'Should have two messages added.');

        const hasFocus = (node: Node) => Focus.search(SugarElement.fromDom(node)).isSome();

        Focus.focus(SugarElement.fromDom(n2.getEl()));
        assert.isTrue(hasFocus(n2.getEl()), 'Focus should be on notification 2');

        n2.close();
        assert.isTrue(hasFocus(n1.getEl()), 'Focus should be on notification 1');

        n1.close();
        assert.isTrue(editor.hasFocus(), 'Focus should be on the editor');
      });

      context('focus is placed outside of the editor', () => {
        const input = SugarElement.fromHtml<HTMLInputElement>('<input class="test-input" />');

        beforeEach(() => {
          const body = SugarElement.fromDom(document.body);
          Insert.append(body, input);
        });

        afterEach(() => {
          Remove.remove(input);
        });

        it('TINY-10282: Should not move focus around if the focus is not in the editor', () => {
          const editor = hook.editor();
          resetNotifications();

          const testMsg1: NotificationSpec = { type: 'warning', text: 'test message 1' };
          const testMsg2: NotificationSpec = { type: 'error', text: 'test message 2' };
          const notifications = editor.notificationManager.getNotifications();

          const hasFocus = (node: SugarElement<Node>) =>
            Focus.search(node).isSome();

          const n1 = editor.notificationManager.open(testMsg1);
          const n2 = editor.notificationManager.open(testMsg2);
          assert.lengthOf(notifications, 2, 'Should have two messages added.');

          Focus.focus(input);

          assert.isTrue(hasFocus(input), 'Focus should remain on the input');

          n2.close();
          assert.isTrue(hasFocus(input), 'Focus should remain on the input');

          n1.close();
          assert.isTrue(hasFocus(input), 'Focus should remain on the input');
          assert.isTrue(!editor.hasFocus(), 'Focus should not be on the editor');
        });
      });

      it('TINY-6528: Notification manager should throw events for notification modification', () => {
        const editor = hook.editor();
        resetNotifications();

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
        assert.lengthOf(notifications, 1, 'Should add notification');
        assert.deepEqual(notifications[0].settings, testMsg, 'Entire notification should be unmodified');

        editor.on('BeforeOpenNotification', (event) => {
          event.notification.type = 'success';
          event.notification.text = 'Modified notification text';
          event.notification.icon = 'user';
          event.notification.progressBar = false;
          event.notification.timeout = 5;
          event.notification.closeButton = false;
        });

        editor.notificationManager.open(testMsg);
        assert.lengthOf(openEvents, 2, 'Should fire OpenNotification event');
        assert.lengthOf(notifications, 2, 'Should add modified notification');

        // Modified notification
        const modified = notifications[1].settings;
        assert.equal(modified.text, 'Modified notification text', 'Should have modified text');
        assert.equal(modified.type, 'success', 'Should have modified type');
        assert.equal(modified.icon, 'user', 'Should have modified icon');
        assert.isFalse(modified.progressBar, 'Should have modified progressBar');
        assert.equal(modified.timeout, 5, 'Should have modified timeout');
        assert.isFalse(modified.closeButton, 'Should have modified closeButton');
      });

      it('TBA: Should not open notification if editor is removed', () => {
        const editor = hook.editor();
        resetNotifications();

        const testMsg1: NotificationSpec = { type: 'warning', text: 'test progressBar message' };

        editor.remove();

        assert.doesNotThrow(() => {
          editor.notificationManager.open(testMsg1);
        }, 'Should never throw exception.');
      });
    });
  });
});
