import { UiFinder, Waiter } from '@ephox/agar';
import { context, describe, it } from '@ephox/bedrock-client';
import { TinyDom, TinyHooks, TinySelections, TinyUiActions } from '@ephox/mcagar';
import { PlatformDetection } from '@ephox/sand';
import { Height, Scroll, SugarBody, SugarLocation } from '@ephox/sugar';

import Editor from 'tinymce/core/api/Editor';
import { getGreenImageDataUrl } from 'tinymce/src/themes/silver/test/ts/module/Assets';
import Theme from 'tinymce/themes/silver/Theme';

describe('browser.tinymce.themes.silver.editor.contexttoolbar.ContextToolbarAnimationTest', () => {
  const hook = TinyHooks.bddSetup<Editor>({
    plugins: '',
    toolbar: '',
    height: 400,
    base_url: '/project/tinymce/js/tinymce',
    content_style: 'body, p { margin: 50; }',
    setup: (ed: Editor) => {
      ed.ui.registry.addContextToolbar('test-node-toolbar', {
        predicate: (node) => node.nodeName.toLowerCase() === 'img',
        items: 'alpha',
        scope: 'node',
        position: 'node'
      });
    }
  }, [ Theme ], true);

  context('TINY-7191: context toolbar layout changes', () => {
    const scrollToBottom = (editor: Editor) => {
      const editorPos = SugarLocation.absolute(TinyDom.contentAreaContainer(editor));
      // Scroll outer window, as context toolbar layout is using it.
      Scroll.to(editorPos.left, editorPos.top + Height.get(TinyDom.contentAreaContainer(editor)));
      // Scroll inner window, as context toolbar layout is using it.
      Scroll.to(editorPos.left, editorPos.top + Height.get(TinyDom.contentAreaContainer(editor)), TinyDom.document(editor));
    };

    const setContent = (editor: Editor) => {
      editor.setContent(
        '<p>filler</p>' +
        '<p>filler</p>' +
        '<p>filler</p>' +
        '<p>' +
          '<img src="' + getGreenImageDataUrl() + '" style="height: 380px; width: 100px">' +
        '</p>' +
        '<p>filler</p>' +
        '<p>filler</p>' +
        '<p>filler</p>'
      );
    };

    it('The context toolbar should gain the transition class on tables', async () => {
      const editor = hook.editor();
      setContent(editor);
      TinySelections.setSelection(editor, [ 3 ], 0, [ 3 ], 1, true);
      await TinyUiActions.pWaitForUi(editor, '.tox-pop');
      scrollToBottom(editor);
      await TinyUiActions.pWaitForUi(editor, '.tox-pop--in-transition');

      if (PlatformDetection.detect().browser.isIE()) {
        // An unrelated bug in the context toolbar positioning code, somewhere, prevents the animation from executing as expected on IE during tests.
        // A JIRA has been logged (TINY-7348) to look into it, and the test cancels here on IE to prevent unwarranted failure.
        // When performing the actions manually they succeed and work as expected.
        // This skip was approved of the Product Manager.
        return;
      }

      await Waiter.pTryUntil('Wait for transition animation class to be removed', () => UiFinder.notExists(SugarBody.body(), '.tox-pop--in-transition'));
    });
  });
});
