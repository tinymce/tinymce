import { Assertions, Keys } from '@ephox/agar';
import { beforeEach, context, describe, it } from '@ephox/bedrock-client';
import { Html, InsertAll, Remove, SugarElement } from '@ephox/sugar';
import { TinyAssertions, TinyContentActions, TinyHooks, TinySelections } from '@ephox/wrap-mcagar';

import Editor from 'tinymce/core/api/Editor';

import * as Utils from '../../module/test/TextPatternsUtils';

describe('browser.tinymce.core.textpatterns.ReplacementTest', () => {
  const hook = TinyHooks.bddSetupLight<Editor>({
    text_patterns: [
      { start: 'brb', replacement: 'be right back' },
      { start: 'heading', replacement: '<h1>My Heading</h1>' },
      { start: 'complex pattern', replacement: '<h1>Text</h1><p>More text</p>' },
      { start: '*', end: '*', format: 'italic' },
      { start: '#', format: 'h1' },
      { start: 'text_pattern', replacement: 'wow' },
      { start: 'world ', replacement: 'World ' }
    ],
    indent: false,
    base_url: '/project/tinymce/js/tinymce'
  }, [ ]);

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
    Assertions.assertHtml('Checking cursor', afterType ?? '', normalizedContent);
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

  it('TINY-9744: replacing the content of a tag that has also a space before should remove the tag but preserve the space', () => {
    const editor = hook.editor();
    Utils.setContentAndPressSpace(editor, 'Hello.<strong> world</strong>&nbsp;', 1, [ 0, 2 ]);
    TinyAssertions.assertContent(editor, '<p>Hello. World &nbsp;</p>');
  });

  context('Fragmented text nodes in a paragraph', () => {
    const testFragmentedText = (editor: Editor, pressKey: () => void, getNodes: () => SugarElement<Node>[], elementPath: number[], offset: number, expected: string) => {
      editor.setContent('<p></p>');
      const paragraph = SugarElement.fromDom(editor.dom.select('p')[0]);
      Remove.empty(paragraph);
      InsertAll.append(paragraph, getNodes());
      editor.focus();
      TinySelections.setCursor(editor, elementPath, offset);
      pressKey();
      TinyAssertions.assertContent(editor, expected);
    };

    const testEnterOnFragmentedText = (editor: Editor, getNodes: () => SugarElement<Node>[], elementPath: number[], offset: number, expected: string) =>
      testFragmentedText(editor, () => TinyContentActions.keystroke(editor, Keys.enter()), getNodes, elementPath, offset, expected);

    const testSpaceOnFragmentedText = (editor: Editor, getNodes: () => SugarElement<Node>[], elementPath: number[], offset: number, expected: string) =>
      testFragmentedText(editor, () => {
        TinyContentActions.keydown(editor, Keys.space());
        editor.execCommand('mceInsertContent', false, ' ');
        TinyContentActions.keyup(editor, Keys.space());
      }, getNodes, elementPath, offset, expected);

    it('TINY-8779: Pattern matches when found in the middle text node', () => {
      const getNodes = () => [
        SugarElement.fromText('text'),
        SugarElement.fromText('_pattern'),
        SugarElement.fromText(' for sure')
      ];
      testEnterOnFragmentedText(hook.editor(), getNodes, [ 0, 1 ], 8, '<p>wow</p><p>for sure</p>');
      testSpaceOnFragmentedText(hook.editor(), getNodes, [ 0, 1 ], 8, '<p>wow&nbsp; for sure</p>');
    });

    it('TINY-8779: Pattern matches when found in the last text node', () => {
      const getNodes = () => [
        SugarElement.fromText('text'),
        SugarElement.fromText('_pattern')
      ];
      testEnterOnFragmentedText(hook.editor(), getNodes, [ 0, 1 ], 8, '<p>wow</p><p>&nbsp;</p>');
      testSpaceOnFragmentedText(hook.editor(), getNodes, [ 0, 1 ], 8, '<p>wow&nbsp;</p>');
    });

    it('TINY-8779: Pattern matches with an inline element amongst text nodes', () => {
      const getNodes = () => {
        const strongNode = SugarElement.fromTag('strong');
        Html.set(strongNode, 'element');
        return [
          SugarElement.fromText('first'),
          SugarElement.fromText(' '),
          strongNode,
          SugarElement.fromText(' text_pattern'),
          SugarElement.fromText(' is big')
        ];
      };
      testEnterOnFragmentedText(hook.editor(), getNodes, [ 0, 3 ], 13, '<p>first <strong>element</strong> wow</p><p>is big</p>');
      testSpaceOnFragmentedText(hook.editor(), getNodes, [ 0, 3 ], 13, '<p>first <strong>element</strong> wow&nbsp; is big</p>');
    });
  });
});
