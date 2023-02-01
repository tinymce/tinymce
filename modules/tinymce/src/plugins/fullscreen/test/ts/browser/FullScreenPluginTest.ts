import { UiFinder } from '@ephox/agar';
import { afterEach, context, describe, it } from '@ephox/bedrock-client';
import { Arr, Type } from '@ephox/katamari';
import { PlatformDetection } from '@ephox/sand';
import { Attribute, Classes, Css, Html, SelectorFind, SugarBody, SugarDocument, SugarElement, SugarShadowDom, Traverse } from '@ephox/sugar';
import { McEditor, TinyContentActions, TinyDom, TinyHooks, TinyUiActions } from '@ephox/wrap-mcagar';
import { assert } from 'chai';

import Editor from 'tinymce/core/api/Editor';
import { NotificationApi } from 'tinymce/core/api/NotificationManager';
import FullscreenPlugin from 'tinymce/plugins/fullscreen/Plugin';
import LinkPlugin from 'tinymce/plugins/link/Plugin';

describe('browser.tinymce.plugins.fullscreen.FullScreenPluginTest', () => {
  let firedEvents: string[] = [];
  const platform = PlatformDetection.detect();

  afterEach(() => {
    firedEvents = [];
  });

  const getContentContainer = (editor: Editor) =>
    SugarShadowDom.getContentContainer(SugarShadowDom.getRootNode(TinyDom.targetElement(editor)));

  const closeOnlyWindow = (editor: Editor) => {
    const dialogs = () => UiFinder.findAllIn(getContentContainer(editor), '[role="dialog"]');
    assert.lengthOf(dialogs(), 1, 'One window exists');
    editor.windowManager.close();
    assert.lengthOf(dialogs(), 0, 'No windows exist');
  };

  const pWaitForDialog = async (editor: Editor, ariaLabel: string) => {
    const dialog = await TinyUiActions.pWaitForDialog(editor);
    if (Attribute.has(dialog, 'aria-labelledby')) {
      const labelledby = Attribute.get(dialog, 'aria-labelledby');
      const dialogLabel = SelectorFind.descendant<HTMLLabelElement>(dialog, '#' + labelledby).getOrDie('Could not find labelledby');
      assert.equal(Html.get(dialogLabel), ariaLabel, 'Checking label text');
    } else {
      throw new Error('Dialog did not have an aria-labelledby');
    }
  };

  const assertApiAndEvents = (editor: Editor, state: boolean) => {
    assert.equal(editor.plugins.fullscreen.isFullscreen(), state, 'Editor isFullscreen state');
    assert.deepEqual(firedEvents, [ 'fullscreenstatechanged:' + state, 'resizeeditor' ], 'Should be expected events and state');
  };

  const assertHtmlAndBodyState = (editor: Editor, shouldExist: boolean) => {
    const existsFn = shouldExist ? UiFinder.exists : UiFinder.notExists;

    try {
      existsFn(SugarBody.body(), 'root:.tox-fullscreen');
    } catch (e) {
      // TODO: Remove this once we figure out why this flakes this adds some extra logging
      if (e instanceof Error) {
        const hasToxFullscreen = Type.isNonNullable(document.querySelector('.tox-fullscreen'));
        throw new Error(`${e.message} body-class: "${document.body.className}" html-class: "${document.documentElement.className}" hasToxFullscreen: ${hasToxFullscreen}`);
      } else {
        throw e;
      }
    }

    existsFn(Traverse.documentElement(SugarDocument.getDocument()), 'root:.tox-fullscreen');
  };

  const assertEditorContainerAndSinkState = (editor: Editor, shouldExist: boolean) => {
    const editorContainer = TinyDom.container(editor);
    const existsFn = shouldExist ? UiFinder.exists : UiFinder.notExists;
    existsFn(editorContainer, 'root:.tox-fullscreen');
    assert.equal(Css.get(editorContainer, 'z-index'), shouldExist ? '1200' : 'auto', 'Editor container z-index');

    const contentContainer = getContentContainer(editor);
    const sink = UiFinder.findIn(contentContainer, '.tox-silver-sink.tox-tinymce-aux').getOrDie();
    assert.equal(Css.get(sink, 'z-index'), shouldExist ? '1201' : '1300', 'Editor sink z-index');
  };

  const assertShadowHostState = (editor: Editor, shouldExist: boolean) => {
    const elm = TinyDom.targetElement(editor);
    if (SugarShadowDom.isInShadowRoot(elm)) {
      const host = SugarShadowDom.getShadowRoot(elm)
        .map(SugarShadowDom.getShadowHost)
        .getOrDie('Expected shadow host');

      assert.equal(Classes.hasAll(host, [ 'tox-fullscreen', 'tox-shadowhost' ]), shouldExist, 'Shadow host classes');
      assert.equal(Css.get(host, 'z-index'), shouldExist ? '1200' : 'auto', 'Shadow host z-index');
    }
  };

  const assertPageState = (editor: Editor, shouldExist: boolean) => {
    assertHtmlAndBodyState(editor, shouldExist);
    assertEditorContainerAndSinkState(editor, shouldExist);
    assertShadowHostState(editor, shouldExist);
  };

  const createNotification = (editor: Editor) =>
    editor.notificationManager.open({
      text: 'This is an informational notification.',
      type: 'info'
    });

  const getNotificationPosition = (notification: NotificationApi) => {
    const elem = Traverse.parent(SugarElement.fromDom(notification.getEl())).getOrDie() as SugarElement<HTMLElement>;
    return {
      top: elem.dom.offsetTop,
      left: elem.dom.offsetLeft
    };
  };

  const assertPositionChanged = (notification: NotificationApi, oldPos: { left: number; top: number }) => {
    const position = getNotificationPosition(notification);
    assert.isFalse(position.top === oldPos.top && position.left === oldPos.left, 'Notification position not updated as expected');
  };

  const fullScreenKeyCombination = (editor: Editor) => {
    const modifiers = platform.os.isMacOS() ? { meta: true, shift: true } : { ctrl: true, shift: true };
    TinyContentActions.keystroke(editor, 'F'.charCodeAt(0), modifiers);
  };

  Arr.each([
    { label: 'Iframe Editor', setup: TinyHooks.bddSetup },
    { label: 'Shadow Dom Editor', setup: TinyHooks.bddSetupInShadowRoot }
  ], (tester) => {
    context(tester.label, () => {
      const hook = tester.setup<Editor>({
        plugins: 'fullscreen link',
        base_url: '/project/tinymce/js/tinymce',
        setup: (editor: Editor) => {
          firedEvents = [];
          editor.on('FullscreenStateChanged ResizeEditor', (e: any) => {
            if (Type.isBoolean(e.state)) {
              firedEvents.push(`${e.type}:${e.state}`);
            } else {
              firedEvents.push(e.type);
            }
          });
        }
      }, [ FullscreenPlugin, LinkPlugin ]);

      it('TBA: Toggle fullscreen on, open link dialog, insert link, close dialog and toggle fullscreen off', async () => {
        const editor = hook.editor();
        assertPageState(editor, false);
        editor.execCommand('mceFullScreen');
        assertApiAndEvents(editor, true);
        firedEvents = [];
        assertPageState(editor, true);
        editor.execCommand('mceLink');
        await pWaitForDialog(editor, 'Insert/Edit Link');
        closeOnlyWindow(editor);
        assertPageState(editor, true);
        editor.execCommand('mceFullScreen');
        assertApiAndEvents(editor, false);
        assertPageState(editor, false);
      });

      it('TINY-2884: Toggle fullscreen on with keyboard, open link dialog, insert link, close dialog and toggle fullscreen off', async () => {
        const editor = hook.editor();
        assertPageState(editor, false);
        fullScreenKeyCombination(editor);
        assertApiAndEvents(editor, true);
        firedEvents = [];
        assertPageState(editor, true);
        editor.execCommand('mceLink');
        await pWaitForDialog(editor, 'Insert/Edit Link');
        closeOnlyWindow(editor);
        assertPageState(editor, true);
        fullScreenKeyCombination(editor);
        assertApiAndEvents(editor, false);
        assertPageState(editor, false);
      });

      it('TINY-2884: Toggle fullscreen with keyboard and cleanup editor should clean up classes', () => {
        const editor = hook.editor();
        fullScreenKeyCombination(editor);
        assertApiAndEvents(editor, true);
        assertPageState(editor, true);
        fullScreenKeyCombination(editor);
      });

      it('TINY-8701: notifications are properly updated when notification is created before fullscreen', () => {
        const editor = hook.editor();
        const notification = createNotification(editor);
        const positions = getNotificationPosition(notification);
        editor.execCommand('mceFullScreen');
        assertPositionChanged(notification, positions);
        notification.close();
        assertApiAndEvents(editor, true);
        assertPageState(editor, true);
        editor.execCommand('mceFullScreen');
      });

      it('TINY-8701: notifications are properly updated when notification is created after fullscreen', () => {
        const editor = hook.editor();
        editor.execCommand('mceFullScreen');
        firedEvents = [];
        const notification = createNotification(editor);
        const positions = getNotificationPosition(notification);
        editor.execCommand('mceFullScreen');
        assertPositionChanged(notification, positions);
        notification.close();
        assertApiAndEvents(editor, false);
        assertPageState(editor, false);
      });
    });

    context(tester.label + ', removal test', () => {
      // This test removes the editor. No tests can or should be added after this test.
      it('TBA: Toggle fullscreen and cleanup editor should clean up classes', async () => {
        const editor = await McEditor.pFromSettings<Editor>({
          plugins: 'fullscreen link',
          base_url: '/project/tinymce/js/tinymce'
        });
        editor.execCommand('mceFullScreen');
        assertPageState(editor, true);
        McEditor.remove(editor);
        assertHtmlAndBodyState(editor, false);
      });
    });
  });
});
