import { Assertions } from '@ephox/agar';
import { describe, it } from '@ephox/bedrock-client';
import { SelectorFind, SugarBody, Traverse } from '@ephox/sugar';
import { TinyAssertions, TinyDom, TinyHooks } from '@ephox/wrap-mcagar';

import Editor from 'tinymce/core/api/Editor';

describe('browser.tinymce.core.init.InitEditorNoThemeIframeTest', () => {
  const hook = TinyHooks.bddSetup<Editor>({
    theme: false,
    base_url: '/project/tinymce/js/tinymce',
    init_instance_callback: (editor: Editor) => {
      editor.dispatch('SkinLoaded');
    }
  }, []);

  it('Tests if the editor is responsive after setting theme to false', () => {
    const editor = hook.editor();
    editor.setContent('<p>a</p>');
    TinyAssertions.assertContent(editor, '<p>a</p>');
  });

  it('Editor element properties', () => {
    const editor = hook.editor();
    const body = SugarBody.body();
    const targetElement = SelectorFind.descendant(body, '#' + editor.id).getOrDie('No elm');
    const editorElement = Traverse.nextSibling(targetElement).getOrDie('No elm');

    Assertions.assertDomEq('Should be expected element', editorElement, TinyDom.container(editor));
    Assertions.assertDomEq('Should be expected element', editorElement, TinyDom.contentAreaContainer(editor));
    Assertions.assertDomEq('Should be expected element', targetElement, TinyDom.targetElement(editor));
  });
});
