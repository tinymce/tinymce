import { ApproxStructure, Assertions, Mouse, UiFinder, Waiter } from '@ephox/agar';
import { context, describe, it } from '@ephox/bedrock-client';
import { Arr } from '@ephox/katamari';
import { Focus, Scroll, SugarBody, SugarElement, SugarLocation, Traverse } from '@ephox/sugar';
import { TinyDom, TinyHooks } from '@ephox/wrap-mcagar';
import { assert } from 'chai';

import Editor from 'tinymce/core/api/Editor';
import { NotificationApi } from 'tinymce/core/api/NotificationManager';

import * as PageScroll from '../../module/PageScroll';
import { resizeToPos } from '../../module/UiUtils';

describe('browser.tinymce.themes.silver.editor.NotificationManagerImplTest', () => {
  const openNotification = (editor: Editor, type: 'info' | 'warning' | 'error' | 'success', text: string, progressBar = false) =>
    editor.notificationManager.open({ type, text, progressBar });

  const assertFocusable = (notification: NotificationApi) => {
    const elm = SugarElement.fromDom(notification.getEl());
    Focus.focus(elm);
    const notificationFocused = Focus.search(elm).isSome();
    assert.isTrue(notificationFocused, 'Notification should be focused');
  };

  const assertPosition = (prefix: string, notification: NotificationApi, x: number, y: number, diff: number = 5) => {
    const elem = Traverse.parent(SugarElement.fromDom(notification.getEl())).getOrDie() as SugarElement<HTMLElement>;
    const top = elem.dom.offsetTop;
    const left = elem.dom.offsetLeft;
    assert.approximately(top, y, diff, `${prefix} top position should be ${y}px~=${top}px`);
    assert.approximately(left, x, diff, `${prefix} left position should be ${x}px~=${left}px`);
  };

  context('Top toolbar positioning', () => {
    const hook = TinyHooks.bddSetupLight<Editor>({
      base_url: '/project/tinymce/js/tinymce',
      width: 600,
      height: 200
    }, []);

    const assertStructure = (label: string, notification: NotificationApi, type: string, message: string, progress?: number) => {
      Assertions.assertStructure(label, ApproxStructure.build((s, str, arr) => s.element('div', {
        attrs: {
          role: str.is('alert')
        },
        classes: [
          arr.has('tox-notification'),
          arr.has(`tox-notification--${type}`)
        ],
        children: [
          s.element('div', {
            classes: [ arr.has('tox-notification__icon') ]
          }),
          s.element('div', {
            classes: [ arr.has('tox-notification__body') ],
            children: [
              s.either([
                s.element('p', {
                  children: [ s.text(str.is(message)) ]
                }),
                s.element('p', {
                  html: str.is(message)
                })
              ])
            ]
          }),
          ...progress !== undefined ? [
            s.element('div', {
              classes: [ arr.has('tox-progress-bar'), arr.has('tox-progress-indicator') ],
              children: [
                s.element('div', {
                  classes: [ arr.has('tox-bar-container') ],
                  children: [
                    s.element('div', {
                      classes: [ arr.has('tox-bar') ],
                      styles: {
                        width: str.is(`${progress}%`)
                      }
                    })
                  ]
                }),
                s.element('div', {
                  classes: [ arr.has('tox-text') ],
                  children: [ s.text(str.is(`${progress}%`)) ]
                })
              ]
            })
          ] : [],
          s.element('button', {
            classes: [
              arr.has('tox-notification__dismiss'),
              arr.has('tox-button'),
              arr.has('tox-button--naked'),
              arr.has('tox-button--icon')
            ],
            children: [
              s.element('span', {
                attrs: {
                  'aria-label': str.is('Close')
                },
                classes: [ arr.has('tox-icon') ]
              })
            ]
          })
        ]
      })), SugarElement.fromDom(notification.getEl()));
    };

    it('Check notification stacking and structure', () => {
      const editor = hook.editor();
      const nError = openNotification(editor, 'error', 'Message 1');
      const nWarn = openNotification(editor, 'warning', 'Message 2');
      const nInfo = openNotification(editor, 'info', 'Message 3');
      const nSuccess = openNotification(editor, 'success', 'Message 4');

      // Check initial structure
      assertStructure('Check error notification structure', nError, 'error', 'Message 1');
      assertStructure('Check warning notification structure', nWarn, 'warning', 'Message 2');
      assertStructure('Check info notification structure', nInfo, 'info', 'Message 3');
      assertStructure('Check success notification structure', nSuccess, 'success', 'Message 4');

      // Check items are positioned so that they are stacked
      assertPosition('Error notification', nError, 220, -192);
      assertPosition('Warning notification', nWarn, 220, -144);
      assertPosition('Info notification', nInfo, 220, -96);
      assertPosition('Success notification', nSuccess, 220, -48);

      nError.close();

      assertPosition('Warning notification', nWarn, 220, -192);
      assertPosition('Info notification', nInfo, 220, -144);
      assertPosition('Success notification', nSuccess, 220, -96);

      nInfo.close();

      assertPosition('Warning notification', nWarn, 220, -192);
      assertPosition('Success notification', nSuccess, 220, -144);

      nWarn.close();
      nSuccess.close();
    });

    it('Check updating notification text content', () => {
      const editor = hook.editor();
      // Change the text and make sure it updates
      const notification = openNotification(editor, 'success', 'Message');
      assertStructure('Check initial notification structure', notification, 'success', 'Message');
      notification.text('Success message');
      assertStructure('Check success notification structure', notification, 'success', 'Success message');
      notification.close();
    });

    it('Check notification progress bar', () => {
      const editor = hook.editor();
      const notification = openNotification(editor, 'success', 'Message', true);
      assertStructure('Check initial notification structure', notification, 'success', 'Message', 0);
      notification.progressBar.value(50);
      assertStructure('Check notification structure with 50% progress', notification, 'success', 'Message', 50);
      notification.progressBar.value(100);
      assertStructure('Check notification structure with 100% progress', notification, 'success', 'Message', 100);
      notification.close();
    });

    it('TINY-7894: Should always render below the top of the header and within the content area', () => {
      const editor = hook.editor();
      const cleanup = PageScroll.setup(editor, 2000);

      // Scroll so the editor is below the bottom of the window
      Scroll.to(0, 0);
      const notification1 = openNotification(editor, 'success', 'Message');
      assertPosition('Below window notification', notification1, 226, -2192);
      notification1.close();

      // Scroll so the header is above the top of the window, but the bottom of the editor is in view
      const topOfEditor = SugarLocation.absolute(TinyDom.container(editor)).top;
      Scroll.to(0, topOfEditor + 100);
      const notification2 = openNotification(editor, 'success', 'Message');
      assertPosition('Partial editor view notification', notification2, 226, -2100);
      notification2.close();

      // Scroll so the editor is above the top of the window
      Scroll.to(0, 4000);
      const notification3 = openNotification(editor, 'success', 'Message');
      assertPosition('Above window notification', notification3, 226, -2000);
      notification3.close();

      cleanup();
    });

    it('TINY-7894: Opening multiple notifications should be able to expand past the bottom of the content area', () => {
      const editor = hook.editor();

      const notifications = Arr.range(9, (i) => openNotification(editor, 'success', `Message ${i + 1}`));
      assertPosition('Last notification is outside the content area', notifications[notifications.length - 1], 220, 192);

      Arr.each(notifications, (notification) => notification.close());
    });

    it('TINY-10286: Notification displays plain text', () => {
      const editor = hook.editor();

      const notification = openNotification(editor, 'success', 'This is a basic notification');
      assertStructure('Check notification structure', notification, 'success', 'This is a basic notification');
      notification.close();
    });

    it('TINY-10286: Notification displays link', () => {
      const editor = hook.editor();

      const notification = openNotification(editor, 'success', 'This notification contains a <a href="example.com">link</a>');
      assertStructure('Check notification structure', notification, 'success', 'This notification contains a <a href="example.com">link</a>');
      notification.close();
    });

    it('TINY-10286: Notification displays sanitized html', () => {
      const editor = hook.editor();

      const notification = openNotification(editor, 'success', 'This contains an image <img src="" onerror=alert("alert")>');
      assertStructure('Check notification structure', notification, 'success', 'This contains an image <img src="">');
      notification.close();
    });
  });

  context('Bottom toolbar positioning', () => {
    const hook = TinyHooks.bddSetup<Editor>({
      base_url: '/project/tinymce/js/tinymce',
      toolbar_location: 'bottom',
      width: 600,
      height: 400
    }, []);

    it('Check notification stacking and structure', async () => {
      const editor = hook.editor();
      const nError = openNotification(editor, 'error', 'Message 1');
      const nWarn = openNotification(editor, 'warning', 'Message 2');

      // Check items are positioned so that they are stacked
      assertPosition('Error notification', nError, 220, -399);
      assertPosition('Warning notification', nWarn, 220, -351);

      // Shrink the editor to 300px
      const resizeHandle = UiFinder.findIn(SugarBody.body(), '.tox-statusbar__resize-handle').getOrDie();
      Mouse.mouseDown(resizeHandle);
      resizeToPos(600, 400, 600, 300);

      // Add a wait to allow the resize event to be processed and notifications to be rerendered
      await Waiter.pTryUntil('Check items are positioned so that they are stacked', () => {
        assertPosition('Error notification', nError, 220, -299);
        assertPosition('Warning notification', nWarn, 220, -251);
      });

      // Check the notification can be focused
      assertFocusable(nError);
      assertFocusable(nWarn);

      nError.close();
      nWarn.close();
    });
  });
});
