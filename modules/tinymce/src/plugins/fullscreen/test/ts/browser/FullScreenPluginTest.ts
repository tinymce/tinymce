import { UiFinder } from '@ephox/agar';
import { context, describe, it } from '@ephox/bedrock-client';
import { Arr, Cell } from '@ephox/katamari';
import { Attribute, Classes, Css, Html, SelectorFind, SugarBody, SugarDocument, SugarShadowDom, Traverse } from '@ephox/sugar';
import { TinyDom, TinyHooks, TinyUiActions } from '@ephox/wrap-mcagar';
import { assert } from 'chai';

import Editor from 'tinymce/core/api/Editor';
import FullscreenPlugin from 'tinymce/plugins/fullscreen/Plugin';
import LinkPlugin from 'tinymce/plugins/link/Plugin';
import Theme from 'tinymce/themes/silver/Theme';

describe('browser.tinymce.plugins.fullscreen.FullScreenPluginTest', () => {
  const lastEventArgs = Cell(null);

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

  const assertApiAndLastEvent = (editor: Editor, state: boolean) => {
    assert.equal(editor.plugins.fullscreen.isFullscreen(), state, 'Editor isFullscreen state');
    assert.equal(lastEventArgs.get().state, state, 'FullscreenStateChanged event state');
  };

  const assertHtmlAndBodyState = (editor: Editor, shouldExist: boolean) => {
    const existsFn = shouldExist ? UiFinder.exists : UiFinder.notExists;
    existsFn(SugarBody.body(), 'root:.tox-fullscreen');
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

  Arr.each([
    { label: 'Iframe Editor', setup: TinyHooks.bddSetup },
    { label: 'Shadow Dom Editor', setup: TinyHooks.bddSetupInShadowRoot }
  ], (tester) => {
    context(tester.label, () => {
      const hook = tester.setup<Editor>({
        plugins: 'fullscreen link',
        base_url: '/project/tinymce/js/tinymce',
        setup: (editor: Editor) => {
          lastEventArgs.set(null);
          editor.on('FullscreenStateChanged', (e: Editor) => {
            lastEventArgs.set(e);
          });
        }
      }, [ FullscreenPlugin, LinkPlugin, Theme ]);

      it('TBA: Toggle fullscreen on, open link dialog, insert link, close dialog and toggle fullscreen off', async () => {
        const editor = hook.editor();
        assertPageState(editor, false);
        editor.execCommand('mceFullScreen');
        assertApiAndLastEvent(editor, true);
        assertPageState(editor, true);
        editor.execCommand('mceLink');
        await pWaitForDialog(editor, 'Insert/Edit Link');
        closeOnlyWindow(editor);
        assertPageState(editor, true);
        editor.execCommand('mceFullScreen');
        assertApiAndLastEvent(editor, false);
        assertPageState(editor, false);
      });

      it('TBA: Toggle fullscreen and cleanup editor should clean up classes', () => {
        const editor = hook.editor();
        editor.execCommand('mceFullScreen');
        assertApiAndLastEvent(editor, true);
        assertPageState(editor, true);
        editor.remove();
        assertHtmlAndBodyState(editor, false);
      });
    });
  });
});
