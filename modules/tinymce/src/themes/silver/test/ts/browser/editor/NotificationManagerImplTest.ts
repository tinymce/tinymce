import { ApproxStructure, Assertions, Mouse, UiFinder, Waiter } from '@ephox/agar';
import { context, describe, it } from '@ephox/bedrock-client';
import { TinyHooks } from '@ephox/mcagar';
import { Focus, SugarBody, SugarElement, Traverse } from '@ephox/sugar';
import { assert } from 'chai';

import Editor from 'tinymce/core/api/Editor';
import { NotificationApi } from 'tinymce/core/api/NotificationManager';
import Theme from 'tinymce/themes/silver/Theme';

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
      width: 600
    }, [ Theme ]);

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
              s.element('p', {
                children: [ s.text(str.is(message)) ]
              })
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
              s.element('div', {
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
      assertPosition('Error notification', nError, 220, -200);
      assertPosition('Warning notification', nWarn, 220, -152);
      assertPosition('Info notification', nInfo, 220, -104);
      assertPosition('Success notification', nSuccess, 220, -56);

      nError.close();

      assertPosition('Warning notification', nWarn, 220, -200);
      assertPosition('Info notification', nInfo, 220, -150);
      assertPosition('Success notification', nSuccess, 220, -100);

      nInfo.close();

      assertPosition('Warning notification', nWarn, 220, -200);
      assertPosition('Success notification', nSuccess, 220, -150);

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
  });

  context('Bottom toolbar positioning', () => {
    const hook = TinyHooks.bddSetup<Editor>({
      base_url: '/project/tinymce/js/tinymce',
      toolbar_location: 'bottom',
      width: 600,
      height: 400
    }, [ Theme ]);

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
      await Waiter.pWait(0);

      // Check items are positioned so that they are stacked
      assertPosition('Error notification', nError, 220, -299);
      assertPosition('Warning notification', nWarn, 220, -251);

      // Check the notification can be focused
      assertFocusable(nError);
      assertFocusable(nWarn);

      nError.close();
      nWarn.close();
    });
  });
});
