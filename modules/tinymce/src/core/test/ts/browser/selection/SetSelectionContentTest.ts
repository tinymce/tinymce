import { ApproxStructure } from '@ephox/agar';
import { describe, it } from '@ephox/bedrock-client';
import { TinyAssertions, TinyHooks, TinySelections } from '@ephox/wrap-mcagar';
import { assert } from 'chai';

import Editor from 'tinymce/core/api/Editor';
import { SetContentEvent } from 'tinymce/core/api/EventTypes';
import { EditorEvent } from 'tinymce/core/api/util/EventDispatcher';
import { SetSelectionContentArgs } from 'tinymce/core/content/ContentTypes';
import * as SetSelectionContent from 'tinymce/core/selection/SetSelectionContent';

describe('browser.tinymce.selection.SetSelectionContentTest', () => {
  const hook = TinyHooks.bddSetupLight<Editor>({
    indent: false,
    base_url: '/project/tinymce/js/tinymce'
  }, []);

  const setContentOverride = (editor: Editor, content: string, overrideContent: string, args: Partial<SetSelectionContentArgs>) => {
    const handler = (e: EditorEvent<SetContentEvent>) => {
      if (e.selection === true) {
        e.preventDefault();
        editor.getBody().innerHTML = overrideContent;
      }
    };

    editor.on('BeforeSetContent', handler);
    SetSelectionContent.setContent(editor, content, args);
    editor.off('BeforeSetContent', handler);
  };

  it('TBA: Should insert a before b', () => {
    const editor = hook.editor();
    editor.setContent('<p>b</p>');
    TinySelections.setCursor(editor, [ 0, 0 ], 0);
    SetSelectionContent.setContent(editor, 'a', {});
    TinyAssertions.assertContent(editor, '<p>ab</p>');
  });

  it('TBA: Should fill the body with x h1 instead of a before b in a paragraph', () => {
    const editor = hook.editor();
    editor.setContent('<p>b</p>');
    TinySelections.setCursor(editor, [ 0, 0 ], 0);
    setContentOverride(editor, 'a', '<h1>x</h1>', {});
    TinyAssertions.assertContent(editor, '<h1>x</h1>');
  });

  it('TBA: Insert content in middle of word, expanded selection', () => {
    const editor = hook.editor();
    editor.setContent('<p>abc</p>');
    TinySelections.setSelection(editor, [ 0, 0 ], 1, [ 0, 0 ], 2);
    SetSelectionContent.setContent(editor, 'X', {});
    TinyAssertions.assertContentStructure(editor,
      ApproxStructure.build((s, str, _arr) => s.element('body', {
        children: [
          s.element('p', {
            children: [
              s.text(str.is('aXc'))
            ]
          })
        ]
      }))
    );
    TinyAssertions.assertSelection(editor, [ 0, 0 ], 2, [ 0, 0 ], 2);
  });

  it('TBA: Insert content in middle of word, collapsed selection', () => {
    const editor = hook.editor();
    editor.setContent('<p>ab</p>');
    TinySelections.setCursor(editor, [ 0, 0 ], 1);
    SetSelectionContent.setContent(editor, 'X', {});
    TinyAssertions.assertContentStructure(editor,
      ApproxStructure.build((s, str, _arr) => s.element('body', {
        children: [
          s.element('p', {
            children: [
              s.text(str.is('aXb'))
            ]
          })
        ]
      }))
    );
    TinyAssertions.assertSelection(editor, [ 0, 0 ], 2, [ 0, 0 ], 2);
  });

  it('TBA: Insert content at start of word, collapsed selection', () => {
    const editor = hook.editor();
    editor.setContent('<p>a</p>');
    TinySelections.setCursor(editor, [ 0, 0 ], 0);
    SetSelectionContent.setContent(editor, 'X', {});
    TinyAssertions.assertContentStructure(editor,
      ApproxStructure.build((s, str, _arr) => s.element('body', {
        children: [
          s.element('p', {
            children: [
              s.text(str.is('Xa'))
            ]
          })
        ]
      }))
    );
    TinyAssertions.assertSelection(editor, [ 0, 0 ], 1, [ 0, 0 ], 1);
  });

  it('TBA: Insert content at end of word, collapsed selection', () => {
    const editor = hook.editor();
    editor.setContent('<p>a</p>');
    TinySelections.setCursor(editor, [ 0, 0 ], 1);
    SetSelectionContent.setContent(editor, 'X', {});
    TinyAssertions.assertContentStructure(editor,
      ApproxStructure.build((s, str, _arr) => s.element('body', {
        children: [
          s.element('p', {
            children: [
              s.text(str.is('aX'))
            ]
          })
        ]
      }))
    );
  });

  it('TBA: Insert content at end of word with leading partial text', () => {
    const editor = hook.editor();
    editor.setContent('<p>a</p>');
    TinySelections.setCursor(editor, [ 0, 0 ], 1);
    SetSelectionContent.setContent(editor, 'b<em>c</em>', {});
    TinyAssertions.assertContentStructure(editor,
      ApproxStructure.build((s, str, _arr) => s.element('body', {
        children: [
          s.element('p', {
            children: [
              s.text(str.is('ab')),
              s.element('em', {
                children: [
                  s.text(str.is('c'))
                ]
              })
            ]
          })
        ]
      }))
    );
  });

  it('TBA: Insert content at end of word with trailing partial text', () => {
    const editor = hook.editor();
    editor.setContent('<p>a</p>');
    TinySelections.setCursor(editor, [ 0, 0 ], 1);
    SetSelectionContent.setContent(editor, '<em>b</em>c', {});
    TinyAssertions.assertContentStructure(editor,
      ApproxStructure.build((s, str, _arr) => s.element('body', {
        children: [
          s.element('p', {
            children: [
              s.text(str.is('a')),
              s.element('em', {
                children: [
                  s.text(str.is('b'))
                ]
              }),
              s.text(str.is('c'))
            ]
          })
        ]
      }))
    );
  });

  it('TINY-5966: Set text content at end of word with a space', () => {
    const editor = hook.editor();
    editor.setContent('<p>a&nbsp;</p>');
    TinySelections.setCursor(editor, [ 0, 0 ], 2);
    SetSelectionContent.setContent(editor, 'b', {});
    TinyAssertions.assertContentStructure(editor,
      ApproxStructure.build((s, str, _arr) => s.element('body', {
        children: [
          s.element('p', {
            children: [
              s.text(str.is('a b'))
            ]
          })
        ]
      }))
    );
  });

  it('TINY-5966: Set text content with leading/trailing spaces', () => {
    const editor = hook.editor();
    editor.setContent('<p>a b c</p>');
    TinySelections.setSelection(editor, [ 0, 0 ], 2, [ 0, 0 ], 3);
    SetSelectionContent.setContent(editor, ' b ', {});
    TinyAssertions.assertContentStructure(editor,
      ApproxStructure.build((s, str, _arr) => s.element('body', {
        children: [
          s.element('p', {
            children: [
              s.text(str.is('a\u00a0 b \u00a0c'))
            ]
          })
        ]
      }))
    );
  });

  it('TINY-5966: Set text content in between 2 nbsps', () => {
    const editor = hook.editor();
    editor.setContent('<p>&nbsp;&nbsp;</p>');
    TinySelections.setCursor(editor, [ 0, 0 ], 1);
    SetSelectionContent.setContent(editor, ' a b ', {});
    TinyAssertions.assertContentStructure(editor,
      ApproxStructure.build((s, str, _arr) => s.element('body', {
        children: [
          s.element('p', {
            children: [
              s.text(str.is('\u00a0 a b \u00a0')),
              s.zeroOrMore(s.element('br', {}))
            ]
          })
        ]
      }))
    );
  });

  it('TINY-5966: Set text content into empty block with leading/trailing spaces', () => {
    const editor = hook.editor();
    editor.setContent('<p></p>');
    TinySelections.setCursor(editor, [ 0, 0 ], 0);
    SetSelectionContent.setContent(editor, ' a b ', {});
    TinyAssertions.assertContentStructure(editor,
      ApproxStructure.build((s, str, _arr) => s.element('body', {
        children: [
          s.element('p', {
            children: [
              s.text(str.is('\u00a0a b\u00a0')),
              s.zeroOrMore(s.element('br', {}))
            ]
          })
        ]
      }))
    );
  });

  it('TINY-5966: Set text content into empty pre block with leading/trailing spaces', () => {
    const editor = hook.editor();
    editor.setContent('<pre></pre>');
    TinySelections.setCursor(editor, [ 0, 0 ], 0);
    SetSelectionContent.setContent(editor, '   a <br>  b  ', {});
    TinyAssertions.assertContentStructure(editor,
      ApproxStructure.build((s, str, _arr) => s.element('body', {
        children: [
          s.element('pre', {
            children: [
              s.text(str.is('   a ')),
              s.element('br', {}),
              s.text(str.is('  b  ')),
              s.zeroOrMore(s.element('br', {}))
            ]
          })
        ]
      }))
    );
  });

  it('TINY-5966: Set text content into pre block using a range selection', () => {
    const editor = hook.editor();
    editor.setContent('<pre>a b c</pre>');
    TinySelections.setSelection(editor, [ 0, 0 ], 2, [ 0, 0 ], 5);
    SetSelectionContent.setContent(editor, ' b <br> c ', {});
    TinyAssertions.assertContentStructure(editor,
      ApproxStructure.build((s, str, _arr) => s.element('body', {
        children: [
          s.element('pre', {
            children: [
              s.text(str.is('a  b '), true),
              s.element('br', {}),
              s.text(str.is(' c '), true),
              s.zeroOrMore(s.element('br', {}))
            ]
          })
        ]
      }))
    );
  });

  it('TINY-3254: The SetContent event should contain the cleaned content', () => {
    const editor = hook.editor();

    let lastSetContent: SetContentEvent | undefined;
    editor.on('SetContent', (e) => {
      lastSetContent = e;
    });

    SetSelectionContent.setContent(editor, '<img src="" onload="alert(1)">');

    assert.equal(lastSetContent?.content, '<img src="">');
  });
});
