import { ApproxStructure, Assertions } from '@ephox/agar';
import { describe, it } from '@ephox/bedrock-client';
import { SelectorFind, SugarBody, Traverse } from '@ephox/sugar';
import { TinyAssertions, TinyDom, TinyHooks } from '@ephox/wrap-mcagar';
import { assert } from 'chai';

import Editor from 'tinymce/core/api/Editor';

describe('browser.tinymce.core.init.InitEditorNoThemeInlineTest', () => {
  const hook = TinyHooks.bddSetup<Editor>({
    theme: false,
    inline: true,
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
    const nextElement = Traverse.nextSibling(targetElement).getOrDie('Should be an element after the target');

    // TODO FIXME this seems like an odd exception
    assert.isNull(editor.getContainer(), 'Should be null since inline without a theme does not set editorContainer');
    Assertions.assertDomEq('Should be expected editor body element', targetElement, TinyDom.body(editor));
    Assertions.assertDomEq('Should be expected editor target element', targetElement, TinyDom.targetElement(editor));
    Assertions.assertDomEq('Editor.contentAreaContainer should equal target element', targetElement, TinyDom.contentAreaContainer(editor));
    // The only element that should be after the target is the TableResizeHandler TableWire div element
    assert.lengthOf(Traverse.nextSiblings(targetElement), 1, 'Should only be one element after target');
    // test with 5px
    const resizeDivStructure = ApproxStructure.fromHtml('<div style="position: static; height: 0px; width: 0px; padding: 0px; margin: 0px; border: 0px;"></div>');
    Assertions.assertStructure('Sibling element should be a resize div', resizeDivStructure, nextElement);
  });
});
