import { Assertions } from '@ephox/agar';
import { describe, it } from '@ephox/bedrock-client';
import { Insert, SelectorFind, SugarBody, SugarElement } from '@ephox/sugar';
import { TinyAssertions, TinyDom, TinyHooks } from '@ephox/wrap-mcagar';

import Editor from 'tinymce/core/api/Editor';

describe('browser.tinymce.core.init.InitEditorThemeFunctionInlineTest', () => {
  const hook = TinyHooks.bddSetup<Editor>({
    theme: (editor, target) => {
      const elm = SugarElement.fromHtml('<div><button>B</button><div></div></div>');

      Insert.after(SugarElement.fromDom(target), elm);

      return {
        editorContainer: elm.dom
      };
    },
    base_url: '/project/tinymce/js/tinymce',
    inline: true,
    init_instance_callback: (editor) => {
      editor.fire('SkinLoaded');
    }
  }, []);

  it('Tests if the editor is responsive after setting theme to a function', () => {
    const editor = hook.editor();
    editor.setContent('<p>a</p>');
    TinyAssertions.assertContent(editor, '<p>a</p>');
  });

  it('Editor element properties', () => {
    const editor = hook.editor();
    const body = SugarBody.body();
    const targetElement = SelectorFind.descendant(body, '#' + editor.id).getOrDie('No elm');
    const editorElement = SelectorFind.descendant(body, '#' + editor.id + '_parent').getOrDie('No elm');

    Assertions.assertDomEq('Should be expected editor container element', editorElement, TinyDom.container(editor));
    Assertions.assertDomEq('Should be expected editor body element', targetElement, TinyDom.body(editor));
    Assertions.assertDomEq('Should be expected editor target element', targetElement, TinyDom.targetElement(editor));
    Assertions.assertDomEq('Should be expected content area container', targetElement, TinyDom.contentAreaContainer(editor));
  });
});
