import { Mouse, UiFinder, Waiter } from '@ephox/agar';
import { describe, it } from '@ephox/bedrock-client';
import { Fun } from '@ephox/katamari';
import { SugarShadowDom } from '@ephox/sugar';
import { TinyDom, TinyHooks, TinyUiActions } from '@ephox/wrap-mcagar';

import Editor from 'tinymce/core/api/Editor';
import Plugin from 'tinymce/plugins/image/Plugin';

describe('browser.tinymce.plugins.link.ContextMenuTest', () => {
  const hook = TinyHooks.bddSetup<Editor>({
    plugins: 'link',
    toolbar: '',
    indent: false,
    base_url: '/project/tinymce/js/tinymce',
    setup: (editor: Editor) => {
      editor.ui.registry.addMenuItem('contextfiller', {
        icon: 'link',
        text: 'Context Filler',
        onAction: Fun.noop
      });

      editor.ui.registry.addContextMenu('contextfiller', {
        update: Fun.constant('contextfiller')
      });
    },
    contextmenu: 'link contextfiller',
    image_caption: true
  }, [ Plugin ], true);

  const pOpenContextMenu = async (editor: Editor, target: string) => {
    // Not sure why this is needed, but without the browser deselects the contextmenu target
    await Waiter.pWait(0);
    await TinyUiActions.pTriggerContextMenu(editor, target, '.tox-silver-sink [role="menuitem"]');
  };

  it('TINY-9491: Opening context menu on a cef', async () => {
    const editor = hook.editor();
    editor.setContent(
      '<div contenteditable="false"><a href="#target">Target</a></div>',
      { format: 'raw' }
    );
    Mouse.contextMenuOn(TinyDom.body(editor), 'a');
    await pOpenContextMenu(editor, 'a');
    UiFinder.notExists(SugarShadowDom.getContentContainer(SugarShadowDom.getRootNode(TinyDom.targetElement(editor))), 'div[title="Link..."');
  });

  it('TINY-9491: Opening context not on a cef', async () => {
    const editor = hook.editor();
    editor.setContent(
      '<div contenteditable="true"><a href="#target">Target</a></div>',
      { format: 'raw' }
    );
    Mouse.contextMenuOn(TinyDom.body(editor), 'a');
    await pOpenContextMenu(editor, 'a');
    UiFinder.exists(SugarShadowDom.getContentContainer(SugarShadowDom.getRootNode(TinyDom.targetElement(editor))), 'div[title="Link..."');
  });
});
