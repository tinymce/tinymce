import { ApproxStructure, Assertions, FocusTools, Keys, Mouse, UiFinder, Waiter } from '@ephox/agar';
import { context, describe, it } from '@ephox/bedrock-client';
import { Arr, Fun, Strings } from '@ephox/katamari';
import { Css, Focus, Scroll, SugarBody, SugarDocument, SugarElement, SugarLocation, Traverse } from '@ephox/sugar';
import { TinyContentActions, TinyDom, TinyHooks, TinyUiActions } from '@ephox/wrap-mcagar';
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
    const elem = SugarElement.fromDom(notification.getEl());
    const top = elem.dom.offsetTop;
    const left = elem.dom.offsetLeft;
    assert.approximately(top, y, diff, `${prefix} top position should be ${y}px~=${top}px`);
    assert.approximately(left, x, diff, `${prefix} left position should be ${x}px~=${left}px`);
  };

  const assertRegionPosition = (notification: NotificationApi, x: number, y: number, diff: number = 5) => {
    const notificationContainer = Traverse.parentElement(SugarElement.fromDom(notification.getEl())).getOrDie();
    const regionTop = notificationContainer.dom.offsetTop;
    const regionLeft = notificationContainer.dom.offsetLeft;
    assert.approximately(regionTop, y, diff, `Notification container top position should be ${y}px~=${regionTop}px`);
    assert.approximately(regionLeft, x, diff, `Notification container left position should be ${x}px~=${regionLeft}px`);
  };

  const pAssertDockedPos = (notification: NotificationApi, position: string) =>
    Waiter.pTryUntil('Wait for notification to be docked', () => {
      const notificationContainer = Traverse.parentElement(SugarElement.fromDom(notification.getEl())).getOrDie();
      const left = notificationContainer.dom.offsetLeft;
      const top = parseInt(Strings.removeTrailing(Css.get(notificationContainer, position), 'px'), 10);

      const assertTop = 0;

      assert.equal(Css.get(notificationContainer, 'position'), 'fixed', 'Notification container should be docked (fixed position)');
      assert.approximately(left, 226, 5, `Notification container left position (${left}) should be 0px`);
      assert.approximately(top, assertTop, 5, `Notification container should be docked to ${position}, ${top}px should be ~${assertTop}px`);
    });

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
            attrs: {
              'aria-label': str.is('Close')
            },
            classes: [
              arr.has('tox-notification__dismiss'),
              arr.has('tox-button'),
              arr.has('tox-button--naked'),
              arr.has('tox-button--icon')
            ],
            children: [
              s.element('span', {
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
      assertRegionPosition(nError, 220, -190);
      assertPosition('Error notification', nError, 0, 4);
      assertPosition('Warning notification', nWarn, 0, 52);
      assertPosition('Info notification', nInfo, 0, 99);
      assertPosition('Success notification', nSuccess, 0, 147);

      nError.close();

      assertRegionPosition(nWarn, 220, -190);
      assertPosition('Warning notification', nWarn, 0, 4);
      assertPosition('Info notification', nInfo, 0, 52);
      assertPosition('Success notification', nSuccess, 0, 99);

      nInfo.close();

      assertRegionPosition(nWarn, 220, -190);
      assertPosition('Warning notification', nWarn, 0, 4);
      assertPosition('Success notification', nSuccess, 0, 52);

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

    it('TINY-7894: Should always render below the top of the header and within the content area', async () => {
      const editor = hook.editor();
      const cleanup = PageScroll.setup(editor, 2000);

      // Scroll so the editor is below the bottom of the window
      Scroll.to(0, 0);
      await Waiter.pTryUntil('Wait for scroll position to be updated', () => {
        assert.equal(window.scrollY, 0, 'window.scrollY should be 0');
      });

      const notification1 = openNotification(editor, 'success', 'Message');
      assertRegionPosition(notification1, 226, -2192);
      assertPosition('Below window notification', notification1, 0, 4);
      notification1.close();

      // Scroll so the header is above the top of the window, but the bottom of the editor is in view
      const topOfEditor = SugarLocation.absolute(TinyDom.container(editor)).top;
      Scroll.to(0, topOfEditor + 100);
      await Waiter.pTryUntil('Wait for scroll position to be updated', () => {
        assert.approximately(window.scrollY, topOfEditor + 100, 5, 'window.ScrollY should be topOfEditor + 100');
      });

      const notification2 = openNotification(editor, 'success', 'Message');
      await pAssertDockedPos(notification2, 'top');
      assertPosition('Partial editor view notification', notification2, 0, 4);
      notification2.close();

      // Scroll so the editor is above the top of the window
      Scroll.to(0, 4000);
      await Waiter.pTryUntil('Wait for scroll position to be updated', () => {
        assert.isAbove(window.scrollY, 3000, 'window.scrollY should be above 3000');
      });

      const notification3 = openNotification(editor, 'success', 'Message');
      await pAssertDockedPos(notification3, 'top');
      assertPosition('Above window notification', notification3, 0, 4);
      notification3.close();

      cleanup();
    });

    it('TINY-7894: Opening multiple notifications should be able to expand past the bottom of the content area', () => {
      const editor = hook.editor();

      const notifications = Arr.range(9, (i) => openNotification(editor, 'success', `Message ${i + 1}`));
      assertRegionPosition(notifications[notifications.length - 1], 220, -190);
      assertPosition('Last notification is outside the content area', notifications[notifications.length - 1], 0, 385);

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

    it('TINY-10597: Notification with links can be tabbed', async () => {
      const editor = hook.editor();
      const doc = SugarDocument.getDocument();

      const notification = openNotification(editor, 'success', 'This notification contains a <a href="example.com">link</a>');
      const notification2 = openNotification(editor, 'success', 'This notification contains a test');

      const hasFocus = (node: Node) => Focus.search(SugarElement.fromDom(node)).isSome();
      TinyContentActions.keystroke(editor, 123, { alt: true });

      await FocusTools.pTryOnSelector('Notification has focus', doc, '.tox-notification');
      assert.isTrue(hasFocus(notification.getEl()), 'Focus should be on notification 1');

      TinyUiActions.keystroke(editor, Keys.tab());
      await FocusTools.pTryOnSelector('Link in notification has focus', doc, 'a[href="example.com"]');
      assert.isTrue(hasFocus(notification.getEl()), 'Focus should be on notification 1');

      TinyUiActions.keystroke(editor, Keys.tab());
      await FocusTools.pTryOnSelector('Dismiss button in notification has focus', doc, '.tox-notification__dismiss');
      assert.isTrue(hasFocus(notification.getEl()), 'Focus should be on notification 1');

      TinyUiActions.keystroke(editor, Keys.tab(), { shift: true });
      await FocusTools.pTryOnSelector('Focus should be back to link', doc, 'a[href="example.com"]');
      assert.isTrue(hasFocus(notification.getEl()), 'Focus should be on notification 1');

      TinyUiActions.keystroke(editor, Keys.tab());
      TinyUiActions.keystroke(editor, Keys.tab());

      await FocusTools.pTryOnSelector('Notification has focus', doc, '.tox-notification');
      assert.isTrue(hasFocus(notification2.getEl()), 'Focus should be on notification 2');

      TinyUiActions.keystroke(editor, Keys.tab());
      await FocusTools.pTryOnSelector('Dismiss button in notification 2 has focus', doc, '.tox-notification__dismiss');
      assert.isTrue(hasFocus(notification2.getEl()), 'Focus should be on notification 2');

      notification.close();
      notification2.close();
    });

    it('TINY-10597: Notification can be closed with escape', async () => {
      const editor = hook.editor();
      const doc = SugarDocument.getDocument();

      const notification = openNotification(editor, 'success', 'This notification contains a test');

      const hasFocus = (node: Node) => Focus.search(SugarElement.fromDom(node)).isSome();
      TinyContentActions.keystroke(editor, 123, { alt: true });

      await FocusTools.pTryOnSelector('Notification has focus', doc, '.tox-notification');
      assert.isTrue(hasFocus(notification.getEl()), 'Focus should on notification 1');

      TinyUiActions.keystroke(editor, Keys.escape());
      TinyUiActions.keystroke(editor, Keys.escape());
      await Waiter.pTryUntil('Notification should be closed', () => UiFinder.notExists(SugarBody.body(), '.tox-notification-container'));
      assert.isTrue(editor.hasFocus(), 'Focus should be on the editor');

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
      assertRegionPosition(nError, 220, -399);
      assertPosition('Error notification', nError, 0, 4);
      assertPosition('Warning notification', nWarn, 0, 52);

      // Shrink the editor to 300px
      const resizeHandle = UiFinder.findIn(SugarBody.body(), '.tox-statusbar__resize-handle').getOrDie();
      Mouse.mouseDown(resizeHandle);
      resizeToPos(600, 400, 600, 300);

      // Add a wait to allow the resize event to be processed and notifications to be rerendered
      await Waiter.pTryUntil('Check items are positioned so that they are stacked', () => {
        assertRegionPosition(nError, 220, -298);
        assertPosition('Error notification', nError, 0, 4);
        assertPosition('Warning notification', nWarn, 0, 52);
      });

      // Check the notification can be focused
      assertFocusable(nError);
      assertFocusable(nWarn);

      nError.close();
      nWarn.close();
    });
  });

  context('Width clamping', () => {
    const longMessage = Arr.range(100, (_) => 'hello').join(' ');

    context('Resize notification to editor width', () => {
      const hook = TinyHooks.bddSetup<Editor>({
        base_url: '/project/tinymce/js/tinymce',
        width: 600,
        height: 400
      }, []);

      it('TINY-10886: Should clamp the notification width to the width of the editor', async () => {
        const editor = hook.editor();
        const nError = openNotification(editor, 'error', longMessage);
        const nWarn = openNotification(editor, 'warning', 'hello');

        assert.approximately(nError.getEl().clientWidth, 600, 10, 'Should be roughly the width of the editor');
        assert.isBelow(nWarn.getEl().clientWidth, 500, 'Should be lower than editor width');

        nError.close();
        nWarn.close();
      });
    });

    context('Resize notification width down', () => {
      const hook = TinyHooks.bddSetup<Editor>({
        base_url: '/project/tinymce/js/tinymce',
        resize: 'both',
        width: 600,
        height: 400
      }, []);

      it('TINY-10894: Should resize the notification width to the smaller editor size on editor resize', async () => {
        const editor = hook.editor();
        const resizeHandle = UiFinder.findIn(SugarBody.body(), '.tox-statusbar__resize-handle').getOrDie();
        const nError = openNotification(editor, 'error', longMessage);

        const beforeResizeWidth = nError.getEl().clientWidth;
        assert.approximately(beforeResizeWidth, 600, 10, 'Should be roughly the width of the editor');

        Mouse.mouseDown(resizeHandle);
        resizeToPos(600, 400, 300, 300);
        await Waiter.pTryUntil('Waited for notification width to change', () => {
          assert.isBelow(nError.getEl().clientWidth, beforeResizeWidth, 'Should be less than the previous width');
        });
      });
    });

    context('Resize notification width up', () => {
      const hook = TinyHooks.bddSetup<Editor>({
        base_url: '/project/tinymce/js/tinymce',
        resize: 'both',
        width: 600,
        height: 400
      }, []);

      it('TINY-10894: Should resize the notification width to the smaller editor size on editor resize', async () => {
        const editor = hook.editor();
        const resizeHandle = UiFinder.findIn(SugarBody.body(), '.tox-statusbar__resize-handle').getOrDie();
        const nError = openNotification(editor, 'error', longMessage);

        const beforeResizeWidth = nError.getEl().clientWidth;
        assert.approximately(beforeResizeWidth, 600, 10, 'Should be roughly the width of the editor');

        Mouse.mouseDown(resizeHandle);
        resizeToPos(600, 400, 800, 300);
        await Waiter.pTryUntil('Waited for notification width to change', () => {
          assert.isAbove(nError.getEl().clientWidth, beforeResizeWidth, 'Should be greater than the previous width');
        });
      });
    });

    context('Resize notification for views', () => {
      const hook = TinyHooks.bddSetup<Editor>({
        base_url: '/project/tinymce/js/tinymce',
        width: 600,
        height: 400,
        setup: (editor: Editor) => {
          editor.ui.registry.addView('test', {
            onShow: Fun.noop,
            onHide: Fun.noop
          });
        }
      }, []);

      it('TINY-10894: Should resize the notification width when togging view', async () => {
        const editor = hook.editor();
        const nError = openNotification(editor, 'error', longMessage);

        const beforeResizeTop = nError.getEl().getBoundingClientRect().top;

        editor.execCommand('ToggleView', false, 'test');

        await Waiter.pTryUntil('Waited for notification width to change', () => {
          assert.isBelow(nError.getEl().getBoundingClientRect().top, beforeResizeTop, 'Should move the notification up since the toolbar is hidden');
          assert.approximately(nError.getEl().clientWidth, 600, 10, 'Should be roughly the width of the editor');
        });

        editor.execCommand('ToggleView', false, 'test');

        await Waiter.pTryUntil('Waited for notification width to change', () => {
          assert.equal(nError.getEl().getBoundingClientRect().top, beforeResizeTop, 'Should move the notification back since they toolbar is shown again');
          assert.approximately(nError.getEl().clientWidth, 600, 10, 'Should be roughly the width of the editor');
        });
      });
    });
  });
});
