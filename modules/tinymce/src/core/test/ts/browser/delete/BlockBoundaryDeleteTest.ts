import { ApproxStructure } from '@ephox/agar';
import { context, describe, it } from '@ephox/bedrock-client';
import { TinyAssertions, TinyHooks, TinySelections } from '@ephox/wrap-mcagar';
import { assert } from 'chai';

import Editor from 'tinymce/core/api/Editor';
import * as BlockBoundaryDelete from 'tinymce/core/delete/BlockBoundaryDelete';
import * as Zwsp from 'tinymce/core/text/Zwsp';

describe('browser.tinymce.core.delete.BlockBoundaryDeleteTest', () => {
  const hook = TinyHooks.bddSetupLight<Editor>({
    base_url: '/project/tinymce/js/tinymce',
    indent: false
  }, [], true);

  const doDelete = (editor: Editor) => {
    const returnVal = BlockBoundaryDelete.backspaceDelete(editor, true);
    returnVal.each((apply) => apply());
    assert.isTrue(returnVal.isSome(), 'Should return true since the operation should have done something');
  };

  const noopDelete = (editor: Editor) => {
    const returnVal = BlockBoundaryDelete.backspaceDelete(editor, true);
    assert.isFalse(returnVal.isSome(), 'Should return false since the operation is a noop');
  };

  const doBackspace = (editor: Editor) => {
    const returnVal = BlockBoundaryDelete.backspaceDelete(editor, false);
    returnVal.each((apply) => apply());
    assert.isTrue(returnVal.isSome(), 'Should return true since the operation should have done something');
  };

  const noopBackspace = (editor: Editor) => {
    const returnVal = BlockBoundaryDelete.backspaceDelete(editor, false);
    assert.isFalse(returnVal.isSome(), 'Should return false since the operation is a noop');
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

  context('Nested elements', () => {
    it('TINY-9230: Delete between two elements where one is nested should merge them', () => {
      const editor = hook.editor();
      editor.setContent('<p>a</p><div><p>b</p></div>');
      TinySelections.setCursor(editor, [ 0, 0 ], 1);
      doDelete(editor);
      TinyAssertions.assertContent(editor, '<p>ab</p>');
      TinyAssertions.assertCursor(editor, [ 0, 0 ], 1);
    });

    it('TINY-9230: Backspace between two elements where one is nested should merge them', () => {
      const editor = hook.editor();
      editor.setContent('<p>a</p><div><p>b</p></div>');
      TinySelections.setCursor(editor, [ 1, 0 ], 0);
      doBackspace(editor);
      TinyAssertions.assertContent(editor, '<p>ab</p>');
      TinyAssertions.assertCursor(editor, [ 0, 0 ], 1);
    });

    it('TINY-9230: Delete between two elements where one is nested in a table should not merge them', () => {
      const editor = hook.editor();
      editor.setContent('<p>a</p><table><tbody><tr><td><p>b</p></td></tr></tbody></table>');
      TinySelections.setCursor(editor, [ 0, 0 ], 1);
      noopDelete(editor);
    });

    it('TINY-9230: Backspace between two elements where one is nested in a table should not merge them', () => {
      const editor = hook.editor();
      editor.setContent('<p>a</p><table><tbody><tr><td><p>b</p></td></tr></tbody></table>');
      TinySelections.setCursor(editor, [ 1, 0, 0, 0 ], 0);
      noopBackspace(editor);
    });

    it('TINY-9230: Delete between two cells should be a noop', () => {
      const editor = hook.editor();
      editor.setContent('<table><tbody><tr><td><p>b</p></td><td><p>b</p></tr></tbody></table>');
      TinySelections.setCursor(editor, [ 0, 0, 0, 0, 0, 0 ], 1);
      noopDelete(editor);
    });

    it('TINY-9230: Backspace between two cells should be a noop', () => {
      const editor = hook.editor();
      editor.setContent('<table><tbody><tr><td><p>b</p></td><td><p>b</p></tr></tbody></table>');
      TinySelections.setCursor(editor, [ 0, 0, 0, 1, 0, 0 ], 0);
      noopBackspace(editor);
    });

    it('TINY-9230: Delete between two editing hosts should be a noop', () => {
      const editor = hook.editor();
      editor.setContent('<div contenteditable="false"><div contenteditable="true">a</div></div><div contenteditable="false"><div contenteditable="true">b</div></div>');
      TinySelections.setCursor(editor, [ 1, 0, 0 ], 1); // Start index off by one to compensate for fake caret paragraph
      noopDelete(editor);
    });

    it('TINY-9230: Backspace between two editing hosts should be a noop', () => {
      const editor = hook.editor();
      editor.setContent('<div contenteditable="false"><div contenteditable="true">a</div></div><div contenteditable="false"><div contenteditable="true">b</div></div>');
      TinySelections.setCursor(editor, [ 2, 0, 0 ], 0); // Start index off by one to compensate for fake caret paragraph
      noopBackspace(editor);
    });
  });

  context('Transparent elements', () => {
    it('TINY-9230: Delete between two transparent blocks should merge them', () => {
      const editor = hook.editor();
      editor.setContent('<a href="#1"><p>a</p></a><a href="#2"><p>b</p></a>');
      TinySelections.setCursor(editor, [ 0, 0, 0 ], 1);
      doDelete(editor);
      TinyAssertions.assertContentStructure(editor,
        ApproxStructure.build((s, str, _arr) => s.element('body', {
          children: [
            s.element('a', {
              attrs: {
                'href': str.is('#1'),
                'data-mce-block': str.is('true')
              },
              children: [
                s.element('p', {
                  children: [
                    s.text(str.is('a')),
                    s.text(str.is('b'))
                  ]
                })
              ]
            })
          ]
        }))
      );
      TinyAssertions.assertContent(editor, '<a href="#1"><p>ab</p></a>');
      TinyAssertions.assertCursor(editor, [ 0, 0, 0 ], 1);
    });

    it('TINY-9230: Backspace between two transparent blocks should merge', () => {
      const editor = hook.editor();
      editor.setContent('<a href="#1"><p>a</p></a><a href="#2"><p>b</p></a>');
      TinySelections.setCursor(editor, [ 1, 0, 0 ], 0);
      doBackspace(editor);
      TinyAssertions.assertContentStructure(editor,
        ApproxStructure.build((s, str, _arr) => s.element('body', {
          children: [
            s.element('a', {
              attrs: {
                'href': str.is('#1'),
                'data-mce-block': str.is('true')
              },
              children: [
                s.element('p', {
                  children: [
                    s.text(str.is('a')),
                    s.text(str.is('b'))
                  ]
                })
              ]
            })
          ]
        }))
      );
      TinyAssertions.assertContent(editor, '<a href="#1"><p>ab</p></a>');
      TinyAssertions.assertCursor(editor, [ 0, 0, 0 ], 1);
    });
  });

  it('TINY-9454: Should preserve formatting when merging with backspace from an empty block to an empty block', () => {
    const editor = hook.editor();
    editor.setContent(
      `<p>1st</p>` +
      `<p><span data-mce-style="font-family: symbol;" style="font-family: symbol;"><em><strong><br data-mce-bogus="1"></strong><i></i></em></span><strong><em></em></strong></p>` +
      `<p><span data-mce-style="font-family: arial;" style="font-family: arial;"><strong><em><br data-mce-bogus="1"></em></strong></span></p>` +
      `<p>4th</p>`,
      { format: 'raw' }
    );

    TinySelections.setCursor(editor, [ 2, 0, 0, 0 ], 0);
    doBackspace(editor);

    TinyAssertions.assertContentStructure(editor,
      ApproxStructure.build((s, str, _arr) => s.element('body', {
        children: [
          s.element('p', { children: [ s.text(str.is('1st')) ] }),
          s.element('p', {
            children: [
              s.element('span', {
                attrs: {
                  'style': str.is('font-family: symbol;'),
                  'data-mce-style': str.is('font-family: symbol;'),
                },
                children: [
                  s.element('em', {
                    children: [
                      s.element('strong', { })
                    ]
                  }),
                ],
              }),
            ]
          }),
          s.element('p', { children: [ s.text(str.is('4th')) ] }),
        ]
      }))
    );

    TinyAssertions.assertContent(
      editor,
      `<p>1st</p>` +
      `<p><span data-mce-style="font-family: symbol;" style="font-family: symbol;"><em><strong><br data-mce-bogus="1"></strong></em></span></p>` +
      `<p>4th</p>`,
      { format: 'raw' }
    );

    TinyAssertions.assertCursor(editor, [ 1, 0, 0, 0 ], 0);
  });
});
