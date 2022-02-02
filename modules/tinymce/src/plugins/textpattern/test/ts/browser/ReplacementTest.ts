import { Assertions } from '@ephox/agar';
import { beforeEach, describe, it } from '@ephox/bedrock-client';
import { TinyAssertions, TinyHooks } from '@ephox/wrap-mcagar';

import Editor from 'tinymce/core/api/Editor';
import Plugin from 'tinymce/plugins/textpattern/Plugin';
import Theme from 'tinymce/themes/silver/Theme';

import * as Utils from '../module/test/Utils';

describe('browser.tinymce.plugins.textpattern.ReplacementTest', () => {
  const hook = TinyHooks.bddSetupLight<Editor>({
    textpattern_patterns: [
      { start: 'brb', replacement: 'be right back' },
      { start: 'heading', replacement: '<h1>My Heading</h1>' },
      { start: 'complex pattern', replacement: '<h1>Text</h1><p>More text</p>' },
      { start: '*', end: '*', format: 'italic' },
      { start: '#', format: 'h1' }
    ],
    indent: false,
    plugins: 'textpattern',
    base_url: '/project/tinymce/js/tinymce'
  }, [ Plugin, Theme ]);

  beforeEach(() => {
    const editor = hook.editor();
    editor.setContent('');
  });

  const assertContentAndCursor = (editor: Editor, beforeType: string, afterType?: string) => {
    const normalize = afterType === undefined;
    if (normalize) {
      afterType = beforeType.replace(/<(([^> ]*)[^>]*)>(&nbsp;| )\|<\/\2>/g, '<$1>|</$2>').replace(/&nbsp;/g, ' ');
      beforeType = beforeType.replace(/\|/g, '');
    }

    TinyAssertions.assertContent(editor, beforeType);
    editor.insertContent('|');
    const content = editor.getContent();
    const normalizedContent = normalize ? content.replace(/&nbsp;/g, ' ') : content;
    Assertions.assertHtml('Checking cursor', afterType, normalizedContent);
  };

  it('Apply html replacement pattern on space', () => {
    const editor = hook.editor();
    Utils.setContentAndPressSpace(editor, 'heading');
    assertContentAndCursor(editor, '<h1>My Heading</h1><p>&nbsp;</p>', '<h1>My Heading</h1><p>&nbsp;|</p>');
  });

  it('Apply html replacement pattern on enter', () => {
    const editor = hook.editor();
    Utils.setContentAndPressEnter(editor, 'heading');
    assertContentAndCursor(editor, '<h1>My Heading</h1><p>&nbsp;|</p>');
  });

  it('Apply html replacement pattern on enter in middle of word', () => {
    const editor = hook.editor();
    Utils.setContentAndPressEnter(editor, 'XheadingX', 8);
    assertContentAndCursor(editor, '<p>X</p><h1>My Heading</h1><p>&nbsp;</p><p>|X</p>');
  });

  it('Apply complex html replacement pattern on enter', () => {
    const editor = hook.editor();
    Utils.setContentAndPressEnter(editor, 'complex pattern');
    assertContentAndCursor(editor, '<h1>Text</h1><p>More text</p><p>&nbsp;|</p>');
  });

  it('Apply text replacement pattern on space', () => {
    const editor = hook.editor();
    Utils.setContentAndPressSpace(editor, 'brb');
    assertContentAndCursor(editor, '<p>be right back&nbsp;|</p>');
  });

  it('Apply text replacement pattern on space with content before', () => {
    const editor = hook.editor();
    Utils.setContentAndPressSpace(editor, 'Xbrb');
    assertContentAndCursor(editor, '<p>Xbe right back&nbsp;|</p>');
  });

  it('Apply text replacement pattern on space with content after', () => {
    const editor = hook.editor();
    Utils.setContentAndPressSpace(editor, 'brbX', 3);
    assertContentAndCursor(editor, '<p>be right back |X</p>');
  });

  it('Do not replace on pattern with content after when cursor is in the wrong position', () => {
    const editor = hook.editor();
    Utils.setContentAndPressSpace(editor, 'brbX');
    assertContentAndCursor(editor, '<p>brbX&nbsp;|</p>');
  });

  it('Apply text replacement pattern on enter', () => {
    const editor = hook.editor();
    Utils.setContentAndPressEnter(editor, 'brb');
    assertContentAndCursor(editor, '<p>be right back</p><p>&nbsp;|</p>');
  });

  it('Apply text replacement pattern on enter with content before', () => {
    const editor = hook.editor();
    Utils.setContentAndPressEnter(editor, 'Xbrb');
    assertContentAndCursor(editor, '<p>Xbe right back</p><p>&nbsp;|</p>');
  });

  it('Apply text replacement pattern on enter with content after', () => {
    const editor = hook.editor();
    Utils.setContentAndPressEnter(editor, 'brbX', 3);
    assertContentAndCursor(editor, '<p>be right back</p><p>|X</p>');
  });

  it('Apply replacement pattern and inline pattern on space', () => {
    const editor = hook.editor();
    Utils.setContentAndPressSpace(editor, '*brb*');
    assertContentAndCursor(editor, '<p><em>be right back</em>&nbsp;|</p>');
  });

  it('Apply replacement pattern and block pattern on enter', () => {
    const editor = hook.editor();
    Utils.setContentAndPressEnter(editor, '#brb');
    assertContentAndCursor(editor, '<h1>be right back</h1><p>&nbsp;|</p>');
  });

  it('Apply replacement pattern italic pattern and block pattern on enter', () => {
    const editor = hook.editor();
    Utils.setContentAndPressEnter(editor, '#*brb*');
    assertContentAndCursor(editor, '<h1><em>be right back</em></h1><p>&nbsp;|</p>');
  });

  it('Apply replacement pattern italic pattern and block pattern on enter with fragmented text', () => {
    const editor = hook.editor();
    Utils.setContentAndPressEnter(editor, '<span data-mce-spelling="invalid">#</span>*brb<span data-mce-spelling="invalid">*</span>', 3, [ 0 ]);
    assertContentAndCursor(editor, '<h1><em>be right back</em></h1><p>&nbsp;|</p>');
  });
});
