import { context, describe, it } from '@ephox/bedrock-client';
import { Fun, Optional } from '@ephox/katamari';
import { TinyDom, TinyHooks } from '@ephox/mcagar';
import { SugarElement, TextContent } from '@ephox/sugar';
import { assert } from 'chai';
import * as fc from 'fast-check';

import Editor from 'tinymce/core/api/Editor';
import { composeList } from 'tinymce/plugins/lists/listmodel/ComposeList';
import { parseLists } from 'tinymce/plugins/lists/listmodel/ParseLists';
import Plugin from 'tinymce/plugins/lists/Plugin';

import * as ArbList from '../module/ArbList';

describe('browser.tinymce.plugins.lists.RetainContentTest', () => {
  context('Model tests', () => {
    const numRuns = 10;

    const testListContent = (list: SugarElement<HTMLUListElement | HTMLOListElement>) => {
      const listTextContent = TextContent.get(list);
      const { entries } = parseLists([ list ], Optional.none())[0];
      const composedListEl = composeList(document, entries).getOrDie('Should produce a list element');
      const composedListTextContent = TextContent.get(composedListEl);

      assert.equal(composedListTextContent, listTextContent, 'Should retain all text content');
    };

    const testListContentHtml = (html: string) => testListContent(SugarElement.fromHtml(html));

    it('TINY-10414: Parse and compose should retain content after nested list', () => {
      testListContentHtml(
        '<ul>' +
          '<li style="list-style-type: none;">' +
            '<ul>' +
              '<li>A</li>' +
            '</ul>' +
            '<p>B</p>' +
            'C' +
          '</li>' +
        '</ul>'
      );
    });

    it('TINY-10414: Parse and compose should retain content before nested list', () => {
      testListContentHtml(
        '<ul>' +
          '<li style="list-style-type: none;">' +
            '<p>A</p>' +
            'B' +
            '<ul>' +
              '<li>C</li>' +
            '</ul>' +
          '</li>' +
        '</ul>'
      );
    });

    it('TINY-10414: Parse and compose should retain content between two nested lists', () => {
      testListContentHtml(
        '<ul>' +
          '<li style="list-style-type: none;">' +
            '<ul>' +
              '<li>A</li>' +
            '</ul>' +
            '<p>B</p>' +
            'C' +
            '<ul>' +
              '<li>D</li>' +
            '</ul>' +
          '</li>' +
        '</ul>'
      );
    });

    it('TINY-10414: Parse and compose should not throw away content', () => {
      fc.assert(fc.property(ArbList.domListGenerator, (list) => testListContent(SugarElement.fromDom(list))), {
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

    const testEditorEffectOnList = (f: (editor: Editor) => void) => {
      fc.assert(fc.property(ArbList.domListWithSelectionGenerator, (arbList) => {
        const editor = hook.editor();
        const beforeEffectTextContent = TextContent.get(SugarElement.fromDom(arbList.list));

        setArbListToEditor(editor, arbList);

        f(editor);

        const afterEffectTextContent = TextContent.get(TinyDom.body(editor));
        assert.equal(afterEffectTextContent, beforeEffectTextContent, 'Should be the original text content');
      }), { numRuns });
    };

    const testEditorCommandOnList = (cmd: string) => testEditorEffectOnList((editor) => editor.execCommand(cmd));

    it('TINY-10414: Setting and getting the list back should always retain all content', () =>
      testEditorEffectOnList(Fun.noop)
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

