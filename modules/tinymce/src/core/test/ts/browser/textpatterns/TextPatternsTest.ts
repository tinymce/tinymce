import { ApproxStructure, Keys } from '@ephox/agar';
import { beforeEach, describe, it } from '@ephox/bedrock-client';
import { Unicode } from '@ephox/katamari';
import { TinyAssertions, TinyContentActions, TinyHooks, TinySelections } from '@ephox/wrap-mcagar';
import { assert } from 'chai';

import Editor from 'tinymce/core/api/Editor';
import ListsPlugin from 'tinymce/plugins/lists/Plugin';

import * as Utils from '../../module/test/TextPatternsUtils';

describe('browser.tinymce.core.textpatterns.TextPatternsTest', () => {
  const hook = TinyHooks.bddSetupLight<Editor>({
    plugins: 'lists',
    base_url: '/project/tinymce/js/tinymce'
  }, [ ListsPlugin ]);

  beforeEach(() => {
    const editor = hook.editor();
    editor.setContent('');
  });

  it('Space on ** without content does nothing', () => {
    const editor = hook.editor();
    Utils.setContentAndPressSpace(editor, '**');
    TinyAssertions.assertContent(editor, '<p>**&nbsp;</p>');
  });

  it('Italic format on single word using space 1', () => {
    const editor = hook.editor();
    Utils.setContentAndPressSpace(editor, '*a&nbsp; *', 5);
    TinyAssertions.assertContentStructure(editor, ApproxStructure.build((s, str) => {
      return Utils.bodyStruct([
        s.element('p', {
          children: [
            s.element('em', {
              children: [
                s.text(str.is('a\u00A0 '), true)
              ]
            }),
            s.text(str.is(Unicode.nbsp), true)
          ]
        })
      ]);
    }));
  });

  it('Italic format on single word using space 2', () => {
    const editor = hook.editor();
    Utils.setContentAndPressSpace(editor, '*a*');
    TinyAssertions.assertContentStructure(editor, Utils.inlineStructHelper('em', 'a'));
  });

  it('Bold format on single word using space', () => {
    const editor = hook.editor();
    Utils.setContentAndPressSpace(editor, '**a**');
    TinyAssertions.assertContentStructure(editor, Utils.inlineStructHelper('strong', 'a'));
  });

  it('Bold/italic format on single word using space', () => {
    const editor = hook.editor();
    Utils.setContentAndPressSpace(editor, '***a***');
    TinyAssertions.assertContentStructure(editor, ApproxStructure.build((s, str) => {
      return Utils.bodyStruct([
        s.element('p', {
          children: [
            s.element('em', {
              children: [
                s.element('strong', {
                  children: [
                    s.text(str.is('a'), true)
                  ]
                })
              ]
            }),
            s.text(str.is(Unicode.nbsp), true)
          ]
        })
      ]);
    }));
  });

  it('Bold format on multiple words using space', () => {
    const editor = hook.editor();
    Utils.setContentAndPressSpace(editor, '**a b**');
    TinyAssertions.assertContentStructure(editor, Utils.inlineStructHelper('strong', 'a b'));
  });

  it('Bold format on single word using enter', () => {
    const editor = hook.editor();
    Utils.setContentAndPressEnter(editor, '**a**');
    TinyAssertions.assertContentStructure(editor, Utils.inlineBlockStructHelper('strong', 'a'));
  });

  it('Bold/italic format on single word using enter', () => {
    const editor = hook.editor();
    Utils.setContentAndPressEnter(editor, '***a***');
    TinyAssertions.assertContentStructure(editor, ApproxStructure.build((s, str) => {
      return Utils.bodyStruct([
        s.element('p', {
          children: [
            s.element('em', {
              children: [
                s.element('strong', {
                  children: [
                    s.text(str.is('a'), true)
                  ]
                })
              ]
            }),
            s.zeroOrOne(s.text(str.is(''), true))
          ]
        }),
        s.element('p', {})
      ]);
    }));
  });

  it('H1 format on single word node using enter', () => {
    const editor = hook.editor();
    Utils.setContentAndPressEnter(editor, '# a');
    TinyAssertions.assertContentStructure(editor, Utils.blockStructHelper('h1', 'a'));
  });

  it('H1 format on single word node with several spaces using enter', () => {
    const editor = hook.editor();
    Utils.setContentAndPressEnter(editor, '#   a'); // nbsp spaces here
    TinyAssertions.assertContentStructure(editor, Utils.blockStructHelper('h1', '   a'));
  });

  it('H2 format on single word node using enter', () => {
    const editor = hook.editor();
    Utils.setContentAndPressEnter(editor, '## a');
    TinyAssertions.assertContentStructure(editor, Utils.blockStructHelper('h2', 'a'));
  });

  it('H2 format on single word node with several spaces using enter', () => {
    const editor = hook.editor();
    Utils.setContentAndPressEnter(editor, '##   a'); // nbsp spaces here
    TinyAssertions.assertContentStructure(editor, Utils.blockStructHelper('h2', '   a'));
  });

  it('H3 format on single word node using enter', () => {
    const editor = hook.editor();
    Utils.setContentAndPressEnter(editor, '### a');
    TinyAssertions.assertContentStructure(editor, Utils.blockStructHelper('h3', 'a'));
  });

  it('H3 format on single word node with several spaces using enter', () => {
    const editor = hook.editor();
    Utils.setContentAndPressEnter(editor, '###   a'); // nbsp spaces here
    TinyAssertions.assertContentStructure(editor, Utils.blockStructHelper('h3', '   a'));
  });

  it('H4 format on single word node using enter', () => {
    const editor = hook.editor();
    Utils.setContentAndPressEnter(editor, '#### a');
    TinyAssertions.assertContentStructure(editor, Utils.blockStructHelper('h4', 'a'));
  });

  it('H4 format on single word node with several spaces using enter', () => {
    const editor = hook.editor();
    Utils.setContentAndPressEnter(editor, '####   a'); // nbsp spaces here
    TinyAssertions.assertContentStructure(editor, Utils.blockStructHelper('h4', '   a'));
  });

  it('H5 format on single word node using enter', () => {
    const editor = hook.editor();
    Utils.setContentAndPressEnter(editor, '##### a');
    TinyAssertions.assertContentStructure(editor, Utils.blockStructHelper('h5', 'a'));
  });

  it('H5 format on single word node with several spaces using enter', () => {
    const editor = hook.editor();
    Utils.setContentAndPressEnter(editor, '#####   a'); // nbsp spaces here
    TinyAssertions.assertContentStructure(editor, Utils.blockStructHelper('h5', '   a'));
  });

  it('H6 format on single word node using enter', () => {
    const editor = hook.editor();
    Utils.setContentAndPressEnter(editor, '###### a');
    TinyAssertions.assertContentStructure(editor, Utils.blockStructHelper('h6', 'a'));
  });

  it('H6 format on single word node with several spaces using enter', () => {
    const editor = hook.editor();
    Utils.setContentAndPressEnter(editor, '######   a'); // nbsp spaces here
    TinyAssertions.assertContentStructure(editor, Utils.blockStructHelper('h6', '   a'));
  });

  it('OL format on single word node using enter', () => {
    const editor = hook.editor();
    Utils.setContentAndPressEnter(editor, '1. a');
    TinyAssertions.assertContentPresence(editor, { ol: 1, li: 2 });
  });

  it('UL format on single word node using enter', () => {
    const editor = hook.editor();
    Utils.setContentAndPressEnter(editor, '* a');
    TinyAssertions.assertContentPresence(editor, { ul: 1, li: 2 });
  });

  it('enter with uncollapsed range does not insert list', () => {
    const editor = hook.editor();
    editor.setContent('<p>* ab</p>');
    editor.focus();
    TinySelections.setSelection(editor, [ 0, 0 ], 3, [ 0, 0 ], 4);
    TinyContentActions.keystroke(editor, Keys.enter());
    TinyAssertions.assertContentPresence(editor, { ul: 0 });
  });

  it('enter with only pattern does not insert list', () => {
    const editor = hook.editor();
    editor.setContent('<p>*</p>');
    editor.focus();
    TinySelections.setCursor(editor, [ 0, 0 ], 1);
    TinyContentActions.keystroke(editor, Keys.enter());
    TinyAssertions.assertContentPresence(editor, { ul: 0 });
  });

  it('inline format with fragmented start sequence', () => {
    const editor = hook.editor();
    Utils.setContentAndPressEnter(editor, '<span data-mce-spellcheck="invalid">*</span>*a**', 4, [ 0, 1 ]);
    TinyAssertions.assertContentStructure(editor, Utils.inlineBlockStructHelper('strong', 'a'));
  });

  it('inline format with fragmented end sequence', () => {
    const editor = hook.editor();
    Utils.setContentAndPressEnter(editor, '**a*<span data-mce-spellcheck="invalid">*</span>', 1, [ 0, 1 ]);
    TinyAssertions.assertContentStructure(editor, Utils.inlineBlockStructHelper('strong', 'a'));
  });

  it('block format with fragmented start sequence', () => {
    const editor = hook.editor();
    Utils.setContentAndPressEnter(editor, '<span data-mce-spellcheck="invalid">1</span>. a', 3, [ 0, 1 ]);
    TinyAssertions.assertContentPresence(editor, { ol: 1, li: 2 });
  });

  it('test inline and block at the same time', () => {
    const editor = hook.editor();
    Utils.setContentAndPressEnter(editor, '* **important list**');
    TinyAssertions.assertContentPresence(editor, { ul: 1, li: 2, strong: 1 });
  });

  it('TINY-8414: should not throw an error if triggered at the start of a text node', () => {
    // Note: This case is largely nonsense and not something that should ever occur naturally
    const editor = hook.editor();
    editor.setContent('<p><a href="about:blank"><span class="test">www</span>.google.com</a></p>');
    TinySelections.setCursor(editor, [ 0, 0, 1 ], 0);
    TinyContentActions.keyup(editor, Keys.space());
    TinyAssertions.assertContent(editor, '<p><a href="about:blank"><span class="test">www</span>.google.com</a></p>');
  });

  it('TINY-8540: should be able to add additional patterns', () => {
    const editor = hook.editor();
    Utils.setContentAndPressSpace(editor, 'brb');
    TinyAssertions.assertContent(editor, '<p>brb&nbsp;</p>');

    editor.options.set('text_patterns', [
      ...editor.options.get('text_patterns'),
      { start: 'brb', replacement: 'be right back' }
    ]);
    Utils.setContentAndPressSpace(editor, 'brb');
    TinyAssertions.assertContent(editor, '<p>be right back&nbsp;</p>');

    editor.options.unset('text_patterns');
  });

  it('TINY-8947: inline text pattern is not applied when both the start and end don’t match', () => {
    const editor = hook.editor();
    editor.options.set('text_patterns', [
      { start: '*', end: '*', format: 'italic' },
    ]);
    Utils.setContentAndPressSpace(editor, '**a*');
    TinyAssertions.assertContent(editor, '<p>*<em>a</em>&nbsp;</p>');

    editor.options.set('text_patterns', [
      { start: '*', end: '*', format: 'italic' },
      { start: '**', end: '**', format: 'bold' },
    ]);
    Utils.setContentAndPressSpace(editor, 'a **test*');
    TinyAssertions.assertContent(editor, '<p>a *<em>test</em>&nbsp;</p>');
    Utils.setContentAndPressSpace(editor, 'a *test**');
    TinyAssertions.assertContent(editor, '<p>a <em>test</em>*&nbsp;</p>');
    Utils.setContentAndPressSpace(editor, 'a ***b**');
    TinyAssertions.assertContent(editor, '<p>a *<strong>b</strong>&nbsp;</p>');
    Utils.setContentAndPressSpace(editor, 'a ***b***');
    TinyAssertions.assertContent(editor, '<p>a <em><strong>b</strong></em>&nbsp;</p>');

    editor.options.unset('text_patterns');
  });

  it('TINY-8949: it should take more inclusive pattern', () => {
    const editor = hook.editor();
    Utils.setContentAndPressSpace(editor, 'a ***test1***');
    TinyAssertions.assertContent(editor, '<p>a <em><strong>test1</strong></em>&nbsp;</p>');

    editor.options.set('text_patterns', [
      { start: '**', end: '**', format: 'bold' },
      { start: '***', end: '***', format: 'italic' },
    ]);

    Utils.setContentAndPressSpace(editor, 'a ***test2***');
    TinyAssertions.assertContent(editor, '<p>a <em>test2</em>&nbsp;</p>');

    editor.options.set('text_patterns', [
      { start: '***', end: '***', format: 'italic' },
      { start: '**', end: '**', format: 'bold' },
    ]);
    Utils.setContentAndPressSpace(editor, 'a ***test3***');
    TinyAssertions.assertContent(editor, '<p>a <em>test3</em>&nbsp;</p>');

    editor.options.set('text_patterns', [
      { start: '**', end: '//', format: 'bold' }
    ]);
    Utils.setContentAndPressSpace(editor, 'a *test3//');
    TinyAssertions.assertContent(editor, '<p>a *test3//&nbsp;</p>');

    editor.options.set('text_patterns', [
      { start: '*', end: '*', format: 'italic' }
    ]);
    Utils.setContentAndPressSpace(editor, 'a *test1* *test2*');
    TinyAssertions.assertContent(editor, '<p>a *test1* <em>test2</em>&nbsp;</p>');

    editor.options.unset('text_patterns');
  });

  it('TINY-8949: the patterns should be applied to the correct element', () => {
    const editor = hook.editor();
    editor.options.set('text_patterns', [
      { start: '**', end: '**', format: 'bold' },
      { start: '***', end: '***', format: 'italic' },
    ]);

    Utils.setContentAndPressSpace(editor, 'a **test1** **test2**');
    TinyAssertions.assertContent(editor, '<p>a **test1** <strong>test2</strong>&nbsp;</p>');

    Utils.setContentAndPressSpace(editor, 'a ***test1*** ***test2***');
    TinyAssertions.assertContent(editor, '<p>a ***test1*** <em>test2</em>&nbsp;</p>');

    editor.options.unset('text_patterns');
  });

  it('TINY-9193: should move the caret to the next line after the Enter key pressed', () => {
    const editor = hook.editor();
    editor.options.set('text_patterns', [
      { start: '~', end: '~', cmd: 'mceInsertContent', value: 'world' }
    ]);
    editor.setContent('<p>Hello</p><p>~test~</p>');
    TinySelections.setCursor(editor, [ 1, 0 ], 6 );
    TinyContentActions.keystroke(editor, Keys.enter());
    TinyAssertions.assertContentPresence(editor, {
      p: 3
    });
    const p = editor.getBody().childNodes;
    assert.equal(p[0].textContent, 'Hello');
    assert.equal(p[1].textContent, 'world');
    // actual content: <p>Hello</p><p>world</p><p>&nbsp;</p>
    TinyAssertions.assertCursor(editor, [ 2 ], 0);

    editor.options.unset('text_patterns');
  });
});
