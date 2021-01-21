import { Assertions } from '@ephox/agar';
import { describe, it } from '@ephox/bedrock-client';
import { TinyAssertions, TinyDom, TinyHooks } from '@ephox/mcagar';
import { Insert, SelectorFind, SugarBody, SugarElement } from '@ephox/sugar';

import Editor from 'tinymce/core/api/Editor';

describe('browser.tinymce.core.init.InitEditorThemeFunctionIframeTest', () => {
  const hook = TinyHooks.bddSetup<Editor>({
    theme: (editor, target) => {
      const elm = SugarElement.fromHtml('<div><button>B</button><div></div></div>');

      Insert.after(SugarElement.fromDom(target), elm);

      return {
        editorContainer: elm.dom,
        iframeContainer: elm.dom.lastChild
      };
    },
    base_url: '/project/tinymce/js/tinymce',
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
    const editorElement = SelectorFind.descendant(body, '#' + editor.id + '_parent').getOrDie('No elm');
    const iframeContainerElement = SelectorFind.descendant(body, '#' + editor.id + '_iframecontainer').getOrDie('No elm');

    Assertions.assertDomEq('Should be expected editor container element', editorElement, TinyDom.container(editor));
    Assertions.assertDomEq('Should be expected iframe container element element', iframeContainerElement, TinyDom.contentAreaContainer(editor));
  });
});
