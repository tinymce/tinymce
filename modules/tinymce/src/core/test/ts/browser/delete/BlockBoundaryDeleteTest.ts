import { ApproxStructure } from '@ephox/agar';
import { describe, it } from '@ephox/bedrock-client';
import { TinyAssertions, TinyHooks, TinySelections } from '@ephox/wrap-mcagar';
import { assert } from 'chai';

import Editor from 'tinymce/core/api/Editor';
import * as BlockBoundaryDelete from 'tinymce/core/delete/BlockBoundaryDelete';
import * as Zwsp from 'tinymce/core/text/Zwsp';
import Theme from 'tinymce/themes/silver/Theme';

describe('browser.tinymce.core.delete.BlockBoundaryDeleteTest', () => {
  const hook = TinyHooks.bddSetupLight<Editor>({
    base_url: '/project/tinymce/js/tinymce',
    indent: false
  }, [ Theme ], true);

  const doDelete = (editor: Editor) => {
    const returnVal = BlockBoundaryDelete.backspaceDelete(editor, true);
    assert.isTrue(returnVal, 'Should return true since the operation should have done something');
  };

  const noopDelete = (editor: Editor) => {
    const returnVal = BlockBoundaryDelete.backspaceDelete(editor, true);
    assert.isFalse(returnVal, 'Should return false since the operation is a noop');
  };

  const doBackspace = (editor: Editor) => {
    const returnVal = BlockBoundaryDelete.backspaceDelete(editor, false);
    assert.isTrue(returnVal, 'Should return true since the operation should have done something');
  };

  const noopBackspace = (editor: Editor) => {
    const returnVal = BlockBoundaryDelete.backspaceDelete(editor, false);
    assert.isFalse(returnVal, 'Should return false since the operation is a noop');
  };

  it('Backspace in same block should remain unchanged', () => {
    const editor = hook.editor();
    editor.setContent('<p>a</p>');
    TinySelections.setCursor(editor, [ 0, 0 ], 1);
    noopBackspace(editor);
    TinyAssertions.assertContent(editor, '<p>a</p>');
    TinyAssertions.assertSelection(editor, [ 0, 0 ], 1, [ 0, 0 ], 1);
  });

  it('Delete in same block should remain unchanged', () => {
    const editor = hook.editor();
    editor.setContent('<p>a</p>');
    TinySelections.setCursor(editor, [ 0, 0 ], 1);
    noopDelete(editor);
    TinyAssertions.assertContent(editor, '<p>a</p>');
    TinyAssertions.assertSelection(editor, [ 0, 0 ], 1, [ 0, 0 ], 1);
  });

  it('Backspace between blocks with different parents should not merge', () => {
    const editor = hook.editor();
    editor.setContent('<p>a</p><div><p>b</p></div>');
    TinySelections.setCursor(editor, [ 1, 0, 0 ], 0);
    noopBackspace(editor);
    TinyAssertions.assertContent(editor, '<p>a</p><div><p>b</p></div>');
    TinyAssertions.assertSelection(editor, [ 1, 0, 0 ], 0, [ 1, 0, 0 ], 0);
  });

  it('Delete between blocks with different parents should not merge', () => {
    const editor = hook.editor();
    editor.setContent('<p>a</p><div><p>b</p></div>');
    TinySelections.setCursor(editor, [ 0, 0 ], 1);
    noopDelete(editor);
    TinyAssertions.assertContent(editor, '<p>a</p><div><p>b</p></div>');
    TinyAssertions.assertSelection(editor, [ 0, 0 ], 1, [ 0, 0 ], 1);
  });

  it('Backspace between textblock and non text block should not merge', () => {
    const editor = hook.editor();
    editor.setContent('<p>a</p><ul><li>b</li></ul>');
    TinySelections.setCursor(editor, [ 1, 0, 0 ], 0);
    noopBackspace(editor);
    TinyAssertions.assertContent(editor, '<p>a</p><ul><li>b</li></ul>');
    TinyAssertions.assertSelection(editor, [ 1, 0, 0 ], 0, [ 1, 0, 0 ], 0);
  });

  it('Delete between textblock and non text block should not merge', () => {
    const editor = hook.editor();
    editor.setContent('<p>a</p><ul><li>b</li></ul>');
    TinySelections.setCursor(editor, [ 0, 0 ], 1);
    noopDelete(editor);
    TinyAssertions.assertContent(editor, '<p>a</p><ul><li>b</li></ul>');
    TinyAssertions.assertSelection(editor, [ 0, 0 ], 1, [ 0, 0 ], 1);
  });

  it('Backspace on range between blocks should not merge (handled elsewhere)', () => {
    const editor = hook.editor();
    editor.setContent('<p>a</p><p>b</p>');
    TinySelections.setSelection(editor, [ 0, 0 ], 1, [ 1, 0 ], 0);
    noopBackspace(editor);
    TinyAssertions.assertContent(editor, '<p>a</p><p>b</p>');
    TinyAssertions.assertSelection(editor, [ 0, 0 ], 1, [ 1, 0 ], 0);
  });

  it('Delete on range between blocks should not merge (handled elsewhere)', () => {
    const editor = hook.editor();
    editor.setContent('<p>a</p><p>b</p>');
    TinySelections.setSelection(editor, [ 0, 0 ], 1, [ 1, 0 ], 0);
    noopDelete(editor);
    TinyAssertions.assertContent(editor, '<p>a</p><p>b</p>');
    TinyAssertions.assertSelection(editor, [ 0, 0 ], 1, [ 1, 0 ], 0);
  });

  it('Backspace between simple blocks should merge', () => {
    const editor = hook.editor();
    editor.setContent('<p>a</p><p>b</p>');
    TinySelections.setCursor(editor, [ 1, 0 ], 0);
    doBackspace(editor);
    TinyAssertions.assertContent(editor, '<p>ab</p>');
    TinyAssertions.assertSelection(editor, [ 0, 0 ], 1, [ 0, 0 ], 1);
  });

  it('Delete between simple blocks should merge', () => {
    const editor = hook.editor();
    editor.setContent('<p>a</p><p>b</p>');
    TinySelections.setCursor(editor, [ 0, 0 ], 1);
    doDelete(editor);
    TinyAssertions.assertContent(editor, '<p>ab</p>');
    TinyAssertions.assertSelection(editor, [ 0, 0 ], 1, [ 0, 0 ], 1);
  });

  it('Backspace between complex blocks should merge', () => {
    const editor = hook.editor();
    editor.setContent('<p>a<em>b</em></p><p><em>c</em>d</p>');
    TinySelections.setCursor(editor, [ 1, 0, 0 ], 0);
    doBackspace(editor);
    TinyAssertions.assertContent(editor, '<p>a<em>b</em><em>c</em>d</p>');
    TinyAssertions.assertSelection(editor, [ 0, 1, 0 ], 1, [ 0, 1, 0 ], 1);
  });

  it('Delete between complex blocks should merge', () => {
    const editor = hook.editor();
    editor.setContent('<p><em>a</em>b</p><p>c<em>d</em></p>');
    TinySelections.setCursor(editor, [ 0, 1 ], 1);
    doDelete(editor);
    TinyAssertions.assertContent(editor, '<p><em>a</em>bc<em>d</em></p>');
    TinyAssertions.assertSelection(editor, [ 0, 1 ], 1, [ 0, 1 ], 1);
  });

  it('Backspace from red span to h1 should merge', () => {
    const editor = hook.editor();
    editor.setContent('<h1>a</h1><p><span style="color: red;">b</span></p>');
    TinySelections.setCursor(editor, [ 1, 0, 0 ], 0);
    doBackspace(editor);
    TinyAssertions.assertContent(editor, '<h1>a<span style="color: red;">b</span></h1>');
    TinyAssertions.assertSelection(editor, [ 0, 0 ], 1, [ 0, 0 ], 1);
  });

  it('Delete from red span to h1 should merge', () => {
    const editor = hook.editor();
    editor.setContent('<p><span style="color: red;">a</span></p><h1>b</h1>');
    TinySelections.setCursor(editor, [ 0, 0, 0 ], 1);
    doDelete(editor);
    TinyAssertions.assertContent(editor, '<p><span style="color: red;">a</span>b</p>');
    TinyAssertions.assertSelection(editor, [ 0, 0, 0 ], 1, [ 0, 0, 0 ], 1);
  });

  it('Backspace from block into block with trailing br should merge', () => {
    const editor = hook.editor();
    editor.setContent('<p>a<br></p><p>b</p>', { format: 'raw' });
    TinySelections.setCursor(editor, [ 1, 0 ], 0);
    doBackspace(editor);
    TinyAssertions.assertContentStructure(editor,
      ApproxStructure.build((s, str, _arr) => {
        return s.element('body', {
          children: [
            s.element('p', {
              children: [
                s.text(str.is('a')),
                s.text(str.is('b'))
              ]
            })
          ]
        });
      })
    );
    TinyAssertions.assertSelection(editor, [ 0, 0 ], 1, [ 0, 0 ], 1);
  });

  it('Delete from block into block with trailing br should merge', () => {
    const editor = hook.editor();
    editor.setContent('<p>a<br></p><p>b</p>', { format: 'raw' });
    TinySelections.setCursor(editor, [ 0, 0 ], 1);
    doDelete(editor);
    TinyAssertions.assertContentStructure(editor,
      ApproxStructure.build((s, str, _arr) => {
        return s.element('body', {
          children: [
            s.element('p', {
              children: [
                s.text(str.is('a')),
                s.text(str.is('b'))
              ]
            })
          ]
        });
      })
    );
    TinyAssertions.assertSelection(editor, [ 0, 0 ], 1, [ 0, 0 ], 1);
  });

  it('Backspace from empty block into content block should merge', () => {
    const editor = hook.editor();
    editor.setContent('<p>a</p><p><br></p>', { format: 'raw' });
    TinySelections.setCursor(editor, [ 1 ], 0);
    doBackspace(editor);
    TinyAssertions.assertContentStructure(editor,
      ApproxStructure.build((s, str, _arr) => {
        return s.element('body', {
          children: [
            s.element('p', {
              children: [
                s.text(str.is('a'))
              ]
            })
          ]
        });
      })
    );
    TinyAssertions.assertSelection(editor, [ 0, 0 ], 1, [ 0, 0 ], 1);
  });

  it('Delete from empty block into content block should merge', () => {
    const editor = hook.editor();
    editor.setContent('<p><br></p><p>a</p>', { format: 'raw' });
    TinySelections.setCursor(editor, [ 0 ], 0);
    doDelete(editor);
    TinyAssertions.assertContentStructure(editor,
      ApproxStructure.build((s, str, _arr) => {
        return s.element('body', {
          children: [
            s.element('p', {
              children: [
                s.text(str.is('a'))
              ]
            })
          ]
        });
      })
    );
    TinyAssertions.assertSelection(editor, [ 0, 0 ], 0, [ 0, 0 ], 0);
  });

  it('Backspace between empty blocks should merge', () => {
    const editor = hook.editor();
    editor.setContent('<p><br></p><p><br></p>', { format: 'raw' });
    TinySelections.setCursor(editor, [ 1 ], 0);
    doBackspace(editor);
    TinyAssertions.assertContentStructure(editor,
      ApproxStructure.build((s, _str, _arr) => {
        return s.element('body', {
          children: [
            s.element('p', {
              children: [
                s.element('br', {})
              ]
            })
          ]
        });
      })
    );
    TinyAssertions.assertSelection(editor, [ 0 ], 0, [ 0 ], 0);
  });

  it('Delete between empty blocks should merge', () => {
    const editor = hook.editor();
    editor.setContent('<p><br></p><p><br></p>', { format: 'raw' });
    TinySelections.setCursor(editor, [ 0 ], 0);
    doDelete(editor);
    TinyAssertions.assertContentStructure(editor,
      ApproxStructure.build((s, _str, _arr) => {
        return s.element('body', {
          children: [
            s.element('p', {
              children: [
                s.element('br', {})
              ]
            })
          ]
        });
      })
    );
    TinyAssertions.assertSelection(editor, [ 0 ], 0, [ 0 ], 0);
  });

  it('Backspace from block into block with trailing noneditable should merge', () => {
    const editor = hook.editor();
    editor.setContent('<p>a<span contentEditable="false">b</span></p><p>c</p>', { format: 'raw' });
    TinySelections.setCursor(editor, [ 1, 0 ], 0);
    doBackspace(editor);
    TinyAssertions.assertContentStructure(editor,
      ApproxStructure.build((s, str, _arr) => s.element('body', {
        children: [
          s.element('p', {
            children: [
              s.text(str.is('a')),
              s.element('span', {
                attrs: {
                  contenteditable: str.is('false')
                },
                children: [
                  s.text(str.is('b'))
                ]
              }),
              s.text(str.is(Zwsp.ZWSP)),
              s.text(str.is('c'))
            ]
          })
        ]
      }))
    );
    TinyAssertions.assertSelection(editor, [ 0, 2 ], 1, [ 0, 2 ], 1);
  });

  it('Delete from block into block with trailing contenteditable should merge', () => {
    const editor = hook.editor();
    editor.setContent('<p>a<span contentEditable="false">b</span></p><p>c</p>', { format: 'raw' });
    TinySelections.setCursor(editor, [ 0 ], 2);
    doDelete(editor);
    TinyAssertions.assertContentStructure(editor,
      ApproxStructure.build((s, str, _arr) => s.element('body', {
        children: [
          s.element('p', {
            children: [
              s.text(str.is('a')),
              s.element('span', {
                attrs: {
                  contenteditable: str.is('false')
                },
                children: [
                  s.text(str.is('b'))
                ]
              }),
              s.text(str.is(Zwsp.ZWSP)),
              s.text(str.is('c'))
            ]
          })
        ]
      }))
    );
    TinyAssertions.assertSelection(editor, [ 0, 2 ], 1, [ 0, 2 ], 1);
  });
});
