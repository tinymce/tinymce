import { context, describe, it } from '@ephox/bedrock-client';
import { Fun, Optional } from '@ephox/katamari';
import { TinyHooks } from '@ephox/mcagar';
import { SugarElement } from '@ephox/sugar';
import { assert } from 'chai';
import * as fc from 'fast-check';

import Editor from 'tinymce/core/api/Editor';
import { composeList } from 'tinymce/plugins/lists/listmodel/ComposeList';
import { parseLists } from 'tinymce/plugins/lists/listmodel/ParseLists';
import Plugin from 'tinymce/plugins/lists/Plugin';

import * as ArbList from '../module/ArbList';

describe('browser.tinymce.plugins.lists.RetainContentTest', () => {
  const getListTextContent = (el: Element) => el.textContent;

  context('Model tests', () => {
    const numRuns = 1;

    it('TINY-10414: Parse and compose should not throw away content', () => {
      fc.assert(fc.property(ArbList.domListGenerator, (list) => {
        const listTextContent = getListTextContent(list);
        const { entries } = parseLists([ SugarElement.fromDom(list) ], Optional.none())[0];
        const listEl = composeList(document, entries).getOrDie('Should produce a list element');
        assert.equal(getListTextContent(listEl.dom), listTextContent, 'Text content should not been removed');
      }), {
        seed: -757675458,
        numRuns
      });
    });
  });

  context('Editor operations', () => {
    const hook = TinyHooks.bddSetupLight<Editor>({
      indent: false,
      plugins: 'lists',
      base_url: '/project/tinymce/js/tinymce'
    }, [ Plugin ], true);
    const numRuns = 10;

    const setArbListToEditor = (editor: Editor, { list, range }: ArbList.ArbDomListElementWithSelection) => {
      editor.getBody().textContent = '';
      editor.getBody().appendChild(list);
      editor.selection.setRng(range);
    };

    const getEditorTextContent = (editor: Editor) => {
      const editorContent = editor.getContent();
      const el = document.createElement('body');
      el.innerHTML = editorContent;
      return el.textContent;
    };

    const testEditorEffectOnList = (f: (editor: Editor) => void) => {
      fc.assert(fc.property(ArbList.domListWithSelectionGenerator, (arbList) => {
        const editor = hook.editor();
        const listTextContent = getListTextContent(arbList.list);

        setArbListToEditor(editor, arbList);

        f(editor);

        assert.equal(getEditorTextContent(editor), listTextContent, 'Should be the original list content');
      }), { numRuns });
    };

    const testEditorCommandOnList = (cmd: string) => testEditorEffectOnList((editor) => editor.execCommand(cmd));

    it('TINY-10414: Setting and getting the list back should always retain all content', () =>
      testEditorEffectOnList(Fun.noop)
    );

    it('TINY-10414: Applying bold to a list should not affect the text content', () =>
      testEditorCommandOnList('Bold')
    );

    it('TINY-10414: Indenting a list should not affect the text content', () =>
      testEditorCommandOnList('Indent')
    );

    it('TINY-10414: Outdenting a list should not affect the text content', () =>
      testEditorCommandOnList('Outdent')
    );

    it('TINY-10414: Toggling unordered list should should not affect the text content', () =>
      testEditorCommandOnList('InsertUnorderedList')
    );

    it('TINY-10414: Toggling ordered list should not affect the text content', () =>
      testEditorCommandOnList('InsertOrderedList')
    );
  });
});

