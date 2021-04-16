import { UiFinder, Waiter } from '@ephox/agar';
import { afterEach, beforeEach, context, describe, it } from '@ephox/bedrock-client';
import { TinyDom, TinyHooks, TinySelections, TinyUiActions } from '@ephox/mcagar';
import { Height, Insert, Remove, Scroll, Selectors, SugarBody, SugarElement, SugarLocation } from '@ephox/sugar';

import Editor from 'tinymce/core/api/Editor';
import TablesPlugin from 'tinymce/plugins/table/Plugin';
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
        predicate: (node) => node.nodeName && node.nodeName.toLowerCase() === 'img',
        items: 'alpha',
        scope: 'node',
        position: 'node'
      });
    }
  }, [ TablesPlugin, Theme ], true);

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

    beforeEach(() => {
      const styleElement = SugarElement.fromHtml('<style id="styleElement" type="text/css">.tox-context-bar-layout-transition-animation { transition: top 0.1s ease, bottom 1s ease; }</style>');
      SugarBody.body();
      Insert.append(SugarBody.body(), styleElement);
    });

    afterEach(() => {
      const styleElement = Selectors.one('#styleElement', SugarBody.body());

      styleElement.each((element) => {
        Remove.remove(element);
      });
    });

    it('The context toolbar should gain the transition class on tables', async () => {
      const editor = hook.editor();
      setContent(editor);
      TinySelections.setSelection(editor, [ 3 ], 0, [ 3 ], 1, true);
      await TinyUiActions.pWaitForUi(editor, '.tox-pop');
      scrollToBottom(editor);
      await TinyUiActions.pWaitForUi(editor, '.tox-context-bar-layout-transition-animation');
      await Waiter.pTryUntil('Wait for transition animation class to be removed', () => UiFinder.notExists(SugarBody.body(), '.tox-context-bar-layout-transition-animation'));
    });
  });
});
