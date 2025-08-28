import { ApproxStructure } from '@ephox/agar';
import { before, context, describe, it } from '@ephox/bedrock-client';
import { Obj } from '@ephox/katamari';
import { TinyAssertions, TinyHooks, TinySelections } from '@ephox/wrap-mcagar';

import Editor from 'tinymce/core/api/Editor';

describe('browser.tinymce.core.newline.ForcedRootBlockTest', () => {
  const forcedRootBlock = 'p';
  const forcedRootBlockAttrs = { style: 'color: red;', class: 'abc def' };
  const hook = TinyHooks.bddSetupLight<Editor>({
    forced_root_block: forcedRootBlock,
    forced_root_block_attrs: forcedRootBlockAttrs,
    indent: false,
    base_url: '/project/tinymce/js/tinymce'
  }, [], true);

  const bookmarkSpan = '<span data-mce-type="bookmark" id="mce_2_start" data-mce-style="overflow:hidden;line-height:0px" style="overflow:hidden;line-height:0px"></span>';
  const baseExpectedHTML = (innerHTML: string) => `<p class="${forcedRootBlockAttrs.class}" style="${forcedRootBlockAttrs.style}">${innerHTML}</p>`;

  const assertNewLine = (label: string, rootBlock: string, rootBlockAttrs: Record<string, string>, initalHTML: string, expectedHTML: (innerHTML: string) => string) => {
    context(label, () => {
      it('Insert block before', () => {
        const editor = hook.editor();
        editor.setContent(initalHTML);
        TinySelections.setCursor(editor, [ 0, 0 ], 0);
        editor.execCommand('mceInsertNewLine');
        TinyAssertions.assertContentStructure(editor,
          ApproxStructure.build((s, _str, _arr) => s.element('body', {
            children: [
              ApproxStructure.fromHtml(expectedHTML('<br data-mce-bogus="1">')),
              s.element(rootBlock, {})
            ]
          }))
        );
        TinyAssertions.assertSelection(editor, [ 1, 0 ], 0, [ 1, 0 ], 0);
      });

      it('Split block in the middle', () => {
        const editor = hook.editor();
        editor.setContent(initalHTML);
        TinySelections.setCursor(editor, [ 0, 0 ], 1);
        editor.execCommand('mceInsertNewLine');
        TinyAssertions.assertContentStructure(editor,
          ApproxStructure.build((s, _str, _arr) => s.element('body', {
            children: [
              s.element(rootBlock, {}),
              ApproxStructure.fromHtml(expectedHTML('b'))
            ]
          }))
        );
        TinyAssertions.assertSelection(editor, [ 1, 0 ], 0, [ 1, 0 ], 0);
      });

      it('Insert block after', () => {
        const editor = hook.editor();
        editor.setContent(initalHTML);
        TinySelections.setCursor(editor, [ 0, 0 ], 2);
        editor.execCommand('mceInsertNewLine');
        TinyAssertions.assertContentStructure(editor,
          ApproxStructure.build((s, _str, _arr) => s.element('body', {
            children: [
              s.element(rootBlock, {}),
              ApproxStructure.fromHtml(expectedHTML('<br data-mce-bogus="1">'))
            ]
          }))
        );
        TinyAssertions.assertSelection(editor, [ 1 ], 0, [ 1 ], 0);
      });

      it('Insert block after bookmark', () => {
        const editor = hook.editor();
        editor.setContent(`<${rootBlock}>${bookmarkSpan}<br data-mce-bogus="1"></${rootBlock}>`, { format: 'raw' });
        TinySelections.setCursor(editor, [ 0 ], 1);
        editor.execCommand('mceInsertNewLine');
        TinyAssertions.assertContentStructure(editor,
          ApproxStructure.build((s, str) => s.element('body', {
            children: [
              s.element(rootBlock, {
                children: [
                  ApproxStructure.fromHtml(bookmarkSpan),
                  s.element('br', {
                    attrs: {
                      'data-mce-bogus': str.is('1')
                    }
                  })
                ]
              }),
              s.element(rootBlock, {
                attrs: Obj.map(rootBlockAttrs, (val) => str.is(val)),
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
  };

  context('With paragraph forced root block and class/style forced attributes', () => {
    assertNewLine('paragraph, plain', 'p', forcedRootBlockAttrs, '<p>ab</p>', baseExpectedHTML);
    assertNewLine('paragraph, same attributes as forced_root_block_attrs', 'p', forcedRootBlockAttrs, `<p class=${forcedRootBlockAttrs.class} style=${forcedRootBlockAttrs.style}>ab</p>`, baseExpectedHTML);
    assertNewLine('paragraph, only style attribute', 'p', forcedRootBlockAttrs, `<p style=${forcedRootBlockAttrs.style}>ab</p>`, baseExpectedHTML);
    assertNewLine('paragraph, only class attribute', 'p', forcedRootBlockAttrs, `<p class=${forcedRootBlockAttrs.class}>ab</p>`, baseExpectedHTML);
    assertNewLine(
      'paragraph, additional attribute',
      'p',
      forcedRootBlockAttrs,
      '<p data-test="1">ab</p>',
      (innerHTML: string) => `<p class="${forcedRootBlockAttrs.class}" style="${forcedRootBlockAttrs.style}" data-test="1">${innerHTML}</p>`
    );
    assertNewLine(
      'paragraph, custom class attribute',
      'p',
      forcedRootBlockAttrs,
      '<p class="c1">ab</p>',
      (innerHTML: string) => `<p class="${forcedRootBlockAttrs.class + ' c1'}" style="${forcedRootBlockAttrs.style}">${innerHTML}</p>`
    );
    assertNewLine(
      'paragraph, custom style attribute',
      'p',
      forcedRootBlockAttrs,
      '<p style="padding-left: 40px;">ab</p>',
      (innerHTML: string) => `<p class="${forcedRootBlockAttrs.class}" style="${forcedRootBlockAttrs.style + ' padding-left: 40px;'}">${innerHTML}</p>`
    );
  });

  context('With paragraph forced root block and additional data forced root block attribute', () => {
    const additionalForcedRootBlockAttrs = { ...forcedRootBlockAttrs, 'data-test': '1' };
    before(() => {
      hook.editor().options.set('forced_root_block_attrs', additionalForcedRootBlockAttrs);
    });

    assertNewLine(
      'paragraph, additional attribute in forced_root_block_attrs',
      'p',
      additionalForcedRootBlockAttrs,
      '<p>ab</p>',
      (innerHTML: string) => `<p class="${forcedRootBlockAttrs.class}" style="${forcedRootBlockAttrs.style}" data-test="1">${innerHTML}</p>`
    );
    assertNewLine(
      'paragraph, common attribute',
      'p',
      additionalForcedRootBlockAttrs,
      '<p data-test="0">ab</p>',
      (innerHTML: string) => `<p class="${forcedRootBlockAttrs.class}" style="${forcedRootBlockAttrs.style}" data-test="1">${innerHTML}</p>`
    );
  });

  context('With div forced root block element', () => {
    before(() => {
      const editor = hook.editor();
      editor.options.set('forced_root_block_attrs', { ...forcedRootBlockAttrs, 'data-test': '1' });
      editor.options.set('forced_root_block', 'div');
    });

    assertNewLine(
      'div, plain',
      'div',
      forcedRootBlockAttrs,
      '<div>ab</div>',
      (innerHTML: string) => `<div class="${forcedRootBlockAttrs.class}" style="${forcedRootBlockAttrs.style}">${innerHTML}</div>`
    );
  });
});
