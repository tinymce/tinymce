import { ApproxStructure } from '@ephox/agar';
import { after, before, context, describe, it } from '@ephox/bedrock-client';
import { TinyAssertions, TinyHooks, TinySelections } from '@ephox/wrap-mcagar';

import Editor from 'tinymce/core/api/Editor';
import { EditorEvent } from 'tinymce/core/api/util/EventDispatcher';
import * as InsertNewLine from 'tinymce/core/newline/InsertNewLine';
import Theme from 'tinymce/themes/silver/Theme';

describe('browser.tinymce.core.newline.InsertNewLine', () => {
  const hook = TinyHooks.bddSetupLight<Editor>({
    indent: false,
    base_url: '/project/tinymce/js/tinymce'
  }, [ Theme ], true);

  const bookmarkSpan = '<span data-mce-type="bookmark" id="mce_2_start" data-mce-style="overflow:hidden;line-height:0px" style="overflow:hidden;line-height:0px"></span>';

  const insertNewline = (editor: Editor, args: Partial<EditorEvent<KeyboardEvent>>) => {
    InsertNewLine.insert(editor, args as EditorEvent<KeyboardEvent>);
  };

  context('Enter in paragraph', () => {
    it('Insert block before', () => {
      const editor = hook.editor();
      editor.setContent('<p>ab</p>');
      TinySelections.setCursor(editor, [ 0, 0 ], 0);
      insertNewline(editor, { });
      TinyAssertions.assertContent(editor, '<p>&nbsp;</p><p>ab</p>');
      TinyAssertions.assertSelection(editor, [ 1, 0 ], 0, [ 1, 0 ], 0);
    });

    it('Split block in the middle', () => {
      const editor = hook.editor();
      editor.setContent('<p>ab</p>');
      TinySelections.setCursor(editor, [ 0, 0 ], 1);
      insertNewline(editor, { });
      TinyAssertions.assertContent(editor, '<p>a</p><p>b</p>');
      TinyAssertions.assertSelection(editor, [ 1, 0 ], 0, [ 1, 0 ], 0);
    });

    it('Insert block after', () => {
      const editor = hook.editor();
      editor.setContent('<p>ab</p>');
      TinySelections.setCursor(editor, [ 0, 0 ], 2);
      insertNewline(editor, { });
      TinyAssertions.assertContent(editor, '<p>ab</p><p>&nbsp;</p>');
      TinyAssertions.assertSelection(editor, [ 1 ], 0, [ 1 ], 0);
    });

    it('Insert block after bookmark', () => {
      const editor = hook.editor();
      editor.setContent(`<p>${bookmarkSpan}<br data-mce-bogus="1"></p>`, { format: 'raw' });
      TinySelections.setCursor(editor, [ 0 ], 1);
      insertNewline(editor, { });
      TinyAssertions.assertContentStructure(editor,
        ApproxStructure.build((s, str) => s.element('body', {
          children: [
            s.element('p', {
              children: [
                ApproxStructure.fromHtml(bookmarkSpan),
                s.element('br', {
                  attrs: {
                    'data-mce-bogus': str.is('1')
                  }
                })
              ]
            }),
            s.element('p', {
              children: [
                s.element('br', {
                  attrs: {
                    'data-mce-bogus': str.is('1')
                  }
                })
              ]
            })
          ]
        }))
      );
      TinyAssertions.assertSelection(editor, [ 1 ], 0, [ 1 ], 0);
    });
  });

  context('br_newline_selector', () => {
    before(() => {
      hook.editor().settings.br_newline_selector = 'p,div.test';
    });

    after(() => {
      delete hook.editor().settings.br_newline_selector;
    });

    it('Insert newline where br is forced (paragraph)', () => {
      const editor = hook.editor();
      editor.setContent('<p>ab</p>');
      TinySelections.setCursor(editor, [ 0, 0 ], 1);
      insertNewline(editor, { });
      editor.nodeChanged();
      TinyAssertions.assertContent(editor, '<p>a<br />b</p>');
    });

    it('Insert newline where br is forced (div)', () => {
      const editor = hook.editor();
      editor.setContent('<div class="test">ab</div>');
      TinySelections.setCursor(editor, [ 0, 0 ], 1);
      insertNewline(editor, { });
      editor.nodeChanged();
      TinyAssertions.assertContent(editor, '<div class="test">a<br />b</div>');
    });

    it('Insert newline where br is not forced', () => {
      const editor = hook.editor();
      editor.setContent('<div>ab</div>');
      TinySelections.setCursor(editor, [ 0, 0 ], 1);
      insertNewline(editor, { });
      editor.nodeChanged();
      TinyAssertions.assertContent(editor, '<div>a</div><div>b</div>');
    });
  });

  context('no_newline_selector', () => {
    before(() => {
      hook.editor().settings.no_newline_selector = 'p,div.test';
    });

    after(() => {
      delete hook.editor().settings.no_newline_selector;
    });

    it('Insert newline where newline is blocked (paragraph)', () => {
      const editor = hook.editor();
      editor.setContent('<p>ab</p>');
      TinySelections.setCursor(editor, [ 0, 0 ], 1);
      insertNewline(editor, { });
      editor.nodeChanged();
      TinyAssertions.assertContent(editor, '<p>ab</p>');
    });

    it('Insert newline where newline is blocked (div)', () => {
      const editor = hook.editor();
      editor.setContent('<div class="test">ab</div>');
      TinySelections.setCursor(editor, [ 0, 0 ], 1);
      insertNewline(editor, { });
      editor.nodeChanged();
      TinyAssertions.assertContent(editor, '<div class="test">ab</div>');
    });

    it('Insert newline where newline is not blocked', () => {
      const editor = hook.editor();
      editor.setContent('<div>ab</div>');
      TinySelections.setCursor(editor, [ 0, 0 ], 1);
      insertNewline(editor, { });
      editor.nodeChanged();
      TinyAssertions.assertContent(editor, '<div>a</div><div>b</div>');
    });
  });

  it('Insert newline before image in link', () => {
    const editor = hook.editor();
    editor.setContent('<p><a href="#">a<img src="about:blank" /></a></p>');
    TinySelections.setCursor(editor, [ 0, 0 ], 1);
    insertNewline(editor, { });
    TinyAssertions.assertContent(editor, '<p><a href="#">a</a></p><p><a href="#"><img src="about:blank" /></a></p>');
    TinyAssertions.assertSelection(editor, [ 1, 0 ], 0, [ 1, 0 ], 0);
  });
});
