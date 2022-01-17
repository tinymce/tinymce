import { ApproxStructure } from '@ephox/agar';
import { beforeEach, describe, it } from '@ephox/bedrock-client';
import { SugarElements, SugarFragment } from '@ephox/sugar';
import { TinyAssertions, TinyHooks, TinySelections } from '@ephox/wrap-mcagar';

import Editor from 'tinymce/core/api/Editor';
import { rangeInsertNode } from 'tinymce/core/selection/RangeInsertNode';

describe('browser.tinymce.core.selection.RangeInsertNode', () => {
  const hook = TinyHooks.bddSetupLight<Editor>({
    indent: false,
    base_url: '/project/tinymce/js/tinymce'
  }, []);

  const insertNode = (editor: Editor, node: Node | DocumentFragment) => {
    rangeInsertNode(editor.dom, editor.selection.getRng(), node);
  };

  const fragmentFromHtml = (html: string, scope: Document): DocumentFragment =>
    SugarFragment.fromElements(SugarElements.fromHtml(html, scope), scope).dom;

  beforeEach(() => {
    hook.editor().focus();
  });

  it('Insert node at start of text', () => {
    const editor = hook.editor();
    editor.setContent('<p>a</p>');
    TinySelections.setCursor(editor, [ 0, 0 ], 0);
    insertNode(editor, editor.getDoc().createTextNode('X'));
    TinyAssertions.assertContentStructure(editor,
      ApproxStructure.build((s, str, _arr) => s.element('body', {
        children: [
          s.element('p', {
            children: [
              s.text(str.is('X')),
              s.text(str.is('a'))
            ]
          })
        ]
      }))
    );
  });

  it('Insert node at end of text', () => {
    const editor = hook.editor();
    editor.setContent('<p>a</p>');
    TinySelections.setCursor(editor, [ 0, 0 ], 1);
    insertNode(editor, editor.getDoc().createTextNode('X'));
    TinyAssertions.assertContentStructure(editor,
      ApproxStructure.build((s, str, _arr) => s.element('body', {
        children: [
          s.element('p', {
            children: [
              s.text(str.is('a')),
              s.text(str.is('X'))
            ]
          })
        ]
      }))
    );
  });

  it('Insert document fragment at start of text', () => {
    const editor = hook.editor();
    editor.setContent('<p>a</p>');
    TinySelections.setCursor(editor, [ 0, 0 ], 0);
    insertNode(editor, fragmentFromHtml('X', editor.getDoc()));
    TinyAssertions.assertContentStructure(editor,
      ApproxStructure.build((s, str, _arr) => s.element('body', {
        children: [
          s.element('p', {
            children: [
              s.text(str.is('X')),
              s.text(str.is('a'))
            ]
          })
        ]
      }))
    );
  });
});
