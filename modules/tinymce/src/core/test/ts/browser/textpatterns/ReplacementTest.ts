import { Assertions, Keys } from '@ephox/agar';
import { beforeEach, context, describe, it } from '@ephox/bedrock-client';
import { Arr } from '@ephox/katamari';
import { InsertAll, Remove, SugarElement } from '@ephox/sugar';
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
      { start: '#', format: 'h1' }
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

  // Skipping until TINY-8779 is completed.
  it.skip('TINY-8779: Apply replacement pattern with spaces before pressing enter', () => {
    const editor = hook.editor();
    editor.setContent('<p></p>');

    // This test case requires very specific text node setup, so we manipulate
    // the nodes themselves. Importantly
    // a) the selection must be from the paragraph node, not the text nodes
    // b) the non-breaking space must be a separate text node
    const paragraph = SugarElement.fromDom(editor.getBody().childNodes[0]);
    Remove.empty(paragraph);
    InsertAll.append(paragraph, [
      SugarElement.fromText('trailing_space'),
      SugarElement.fromText('\u00A0')
    ]);

    editor.focus();
    TinySelections.setCursor(editor, [ 0 ], 2);
    // This function throws an error here due to the bug identified in TINY-8779
    TinyContentActions.keystroke(editor, Keys.enter());
  });

  context('Matches text nodes in a paragraph', () => {
    const hook = TinyHooks.bddSetupLight<Editor>({
      text_patterns: [
        { start: 'text_pattern', replacement: 'wow' }
      ],
      indent: false,
      base_url: '/project/tinymce/js/tinymce'
    }, [ ]);

    const assertContentAfterPressEnter = (editor: Editor, nodes: Node[], cursorPaths: number[], offset: number, expected: string) => {
      editor.setContent('<p></p>');
      const targetParagraph = editor.dom.select('p')[0];
      Arr.each(nodes, (t) => targetParagraph.appendChild(t));
      editor.focus();
      TinySelections.setCursor(editor, cursorPaths, offset);
      TinyContentActions.keystroke(editor, Keys.enter());
      TinyAssertions.assertContent(editor, expected);
    };

    it('Pattern matches the second text node', () => {
      const nodes = [
        document.createTextNode('text'),
        document.createTextNode('_pattern'),
        document.createTextNode(' for sure')
      ];
      assertContentAfterPressEnter(hook.editor(), nodes, [ 0, 2 ], 8, '<p><br>wow</p><p>for sure</p>');
    });

    it('Pattern matches the last text node', () => {
      const nodes = [
        document.createTextNode('text'),
        document.createTextNode('_pattern')
      ];
      assertContentAfterPressEnter(hook.editor(), nodes, [ 0, 2 ], 8, '<p><br>wow</p><p>&nbsp;</p>');
    });

    it('Have a <strong> amongst text nodes', () => {
      const strongNode = document.createElement('strong');
      strongNode.innerHTML = 'element';
      const nodes = [
        document.createTextNode('first '),
        strongNode,
        document.createTextNode(' text_pattern'),
        document.createTextNode(' is big')
      ];
      assertContentAfterPressEnter(hook.editor(), nodes, [ 0, 3 ], 13, '<p><br>first <strong>element</strong> no_error</p><p>is big</p>');
    });

    it('Add an <em> node', () => {
      const strongNode = document.createElement('strong');
      strongNode.innerHTML = 'element';
      const italicNode = document.createElement('i');
      italicNode.innerHTML = 'italic';
      const nodes = [
        document.createTextNode('first '),
        strongNode,
        document.createTextNode(' text_pattern'),
        italicNode,
        document.createTextNode(' is big')
      ];
      assertContentAfterPressEnter(hook.editor(), nodes, [ 0, 3 ], 13, '<p><br>first <strong>element</strong> no_error</p><p><em>italic</em> is big</p>');
    });
  });
});
