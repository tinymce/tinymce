import { ApproxStructure, Keys } from '@ephox/agar';
import { beforeEach, describe, it } from '@ephox/bedrock-client';
import { Unicode } from '@ephox/katamari';
import { PlatformDetection } from '@ephox/sand';
import { TinyAssertions, TinyContentActions, TinyHooks, TinySelections } from '@ephox/wrap-mcagar';
import { assert } from 'chai';

import Editor from 'tinymce/core/api/Editor';
import ListsPlugin from 'tinymce/plugins/lists/Plugin';
import TextPatternPlugin from 'tinymce/plugins/textpattern/Plugin';
import Theme from 'tinymce/themes/silver/Theme';

import * as Utils from '../module/test/Utils';

describe('browser.tinymce.plugins.textpattern.TextPatternPluginTest', () => {
  const detection = PlatformDetection.detect();
  const hook = TinyHooks.bddSetupLight<Editor>({
    plugins: 'textpattern lists',
    base_url: '/project/tinymce/js/tinymce'
  }, [ ListsPlugin, TextPatternPlugin, Theme ]);

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
    TinyAssertions.assertContentStructure(editor, Utils.blockStructHelper('h1', ' a'));
  });

  it('H2 format on single word node using enter', () => {
    const editor = hook.editor();
    Utils.setContentAndPressEnter(editor, '## a');
    TinyAssertions.assertContentStructure(editor, Utils.blockStructHelper('h2', ' a'));
  });

  it('H3 format on single word node using enter', () => {
    const editor = hook.editor();
    Utils.setContentAndPressEnter(editor, '### a');
    TinyAssertions.assertContentStructure(editor, Utils.blockStructHelper('h3', ' a'));
  });

  it('H4 format on single word node using enter', () => {
    const editor = hook.editor();
    Utils.setContentAndPressEnter(editor, '#### a');
    TinyAssertions.assertContentStructure(editor, Utils.blockStructHelper('h4', ' a'));
  });

  it('H5 format on single word node using enter', () => {
    const editor = hook.editor();
    Utils.setContentAndPressEnter(editor, '##### a');
    TinyAssertions.assertContentStructure(editor, Utils.blockStructHelper('h5', ' a'));
  });

  it('H6 format on single word node using enter', () => {
    const editor = hook.editor();
    Utils.setContentAndPressEnter(editor, '###### a');
    TinyAssertions.assertContentStructure(editor, Utils.blockStructHelper('h6', ' a'));
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

  it('getPatterns/setPatterns', () => {
    const editor = hook.editor();
    // Store the original patterns
    const origPatterns = editor.plugins.textpattern.getPatterns();

    editor.plugins.textpattern.setPatterns([
      { start: '#', format: 'h1' },
      { start: '##', format: 'h2' },
      { start: '###', format: 'h3' }
    ]);

    assert.deepEqual(
      editor.plugins.textpattern.getPatterns(),
      [
        {
          format: 'h3',
          start: '###'
        },
        {
          format: 'h2',
          start: '##'
        },

        {
          format: 'h1',
          start: '#'
        }
      ],
      'should be the same'
    );

    // Restore the original patterns
    editor.plugins.textpattern.setPatterns(origPatterns);
  });

  // TODO TINY-3258 reenable this test when issues with Chrome 72-75 are sorted out
  it('test inline and block at the same time', function () {
    if (detection.browser.isChrome()) {
      this.skip();
    }
    const editor = hook.editor();
    Utils.setContentAndPressEnter(editor, '* **important list**');
    TinyAssertions.assertContentPresence(editor, { ul: 1, li: 2, strong: 1 });
  });
});
