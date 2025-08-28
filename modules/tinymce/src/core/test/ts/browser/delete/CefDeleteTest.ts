import { ApproxStructure, Assertions, Keys } from '@ephox/agar';
import { context, describe, it } from '@ephox/bedrock-client';
import { Arr } from '@ephox/katamari';
import { TinyAssertions, TinyContentActions, TinyHooks, TinyDom, TinySelections, TinyState } from '@ephox/wrap-mcagar';

import Editor from 'tinymce/core/api/Editor';

const applyForDeleteAndBackspace = (fn: (pair: { label: string; key: () => number }) => void) =>
  Arr.each([
    { label: 'Delete', key: Keys.delete },
    { label: 'Backspace', key: Keys.backspace }
  ], fn);

describe('browser.tinymce.core.delete.CefDeleteTest', () => {
  const hook = TinyHooks.bddSetupLight<Editor>({
    base_url: '/project/tinymce/js/tinymce',
    indent: false
  }, [], true);

  const fakeBackspaceKeyOnRange = (editor: Editor) => {
    editor.getDoc().execCommand('Delete');
    TinyContentActions.keyup(editor, Keys.backspace());
  };

  it('Should padd empty ce=true inside ce=false when everything is deleted', () => {
    const editor = hook.editor();
    editor.setContent('<div contenteditable="false">a<p contenteditable="true">a</p>b</div>');
    TinySelections.setSelection(editor, [ 1, 1, 0 ], 0, [ 1, 1, 0 ], 1);
    fakeBackspaceKeyOnRange(editor);
    TinyAssertions.assertContentStructure(editor,
      ApproxStructure.build((s, str, _arr) => {
        return s.element('body', {
          children: [
            s.element('div', {
              children: [
                s.text(str.is('a')),
                s.element('p', {
                  children: [
                    s.element('br', {
                      attrs: {
                        'data-mce-bogus': str.is('1')
                      }
                    })
                  ]
                }),
                s.text(str.is('b'))
              ]
            })
          ]
        });
      })
    );
  });

  it('Should not padd an non empty ce=true inside ce=false', () => {
    const editor = hook.editor();
    editor.setContent('<div contenteditable="false">a<p contenteditable="true">ab</p>b</div>');
    TinySelections.setSelection(editor, [ 1, 1, 0 ], 0, [ 1, 1, 0 ], 1);
    fakeBackspaceKeyOnRange(editor);
    TinyAssertions.assertContentStructure(editor,
      ApproxStructure.build((s, str, _arr) => {
        return s.element('body', {
          children: [
            s.element('div', {
              children: [
                s.text(str.is('a')),
                s.element('p', {
                  children: [
                    s.text(str.is('b'))
                  ]
                }),
                s.text(str.is('b'))
              ]
            })
          ]
        });
      })
    );
  });

  it('Should padd editor with paragraph and br if the editor is empty after delete of a cef element', () => {
    const editor = hook.editor();
    editor.setContent('<div contenteditable="false">a</div>');
    TinySelections.setSelection(editor, [], 1, [], 2);
    TinyContentActions.keystroke(editor, Keys.backspace());
    TinyAssertions.assertSelection(editor, [ 0 ], 0, [ 0 ], 0);
    TinyAssertions.assertContentStructure(editor,
      ApproxStructure.build((s, str, _arr) => {
        return s.element('body', {
          children: [
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
        });
      })
    );
  });

  it('Should padd editor with empty paragraph if we delete last element', () => {
    const editor = hook.editor();
    editor.setContent('<div contenteditable="false">a</div>');
    TinySelections.setSelection(editor, [], 2, [], 2);
    TinyContentActions.keystroke(editor, Keys.backspace());
    TinyAssertions.assertSelection(editor, [ 0 ], 0, [ 0 ], 0);
    TinyAssertions.assertContentStructure(editor,
      ApproxStructure.build((s, str, _arr) => {
        return s.element('body', {
          children: [
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
        });
      })
    );
  });

  it('Should remove fake caret if we delete block cef', () => {
    const editor = hook.editor();
    editor.setContent('<div contenteditable="false">a</div><p>b</p>');
    TinySelections.setSelection(editor, [], 2, [], 2);
    TinyContentActions.keystroke(editor, Keys.backspace());
    TinyAssertions.assertSelection(editor, [ 0, 0 ], 0, [ 0, 0 ], 0);
    TinyAssertions.assertContentStructure(editor,
      ApproxStructure.build((s, str, _arr) => {
        return s.element('body', {
          children: [
            s.element('p', {
              children: [
                s.text(str.is('b'))
              ]
            })
          ]
        });
      })
    );
  });

  context('cef block is at the start/end of the content and covered with the selection', () => {
    applyForDeleteAndBackspace(({ label, key }) => {
      it(`TINY-8729: should delete selected content when cef block is at the start and ${label} is pressed`, () => {
        const editor = hook.editor();
        editor.setContent('<p contenteditable="false">CEF</p><p>abc</p>');
        // actual content: <p data-mce-caret="before"></p><p contenteditable="false">CEF</p><p>abc</p>
        TinySelections.setSelection(editor, [ 0 ], 0, [ 2, 0 ], 2);
        TinyContentActions.keystroke(editor, key());
        TinyAssertions.assertCursor(editor, [ 0, 0 ], 0);
        TinyAssertions.assertContent(editor, '<p>c</p>');
      });

      it(`TINY-8729: should delete selected content when cef block is at the end and ${label} is pressed`, () => {
        const editor = hook.editor();
        editor.setContent('<p>abc</p><p contenteditable="false">CEF</p>');
        TinySelections.setSelection(editor, [ 0, 0 ], 1, [], 2);
        TinyContentActions.keystroke(editor, key());
        TinyAssertions.assertCursor(editor, [ 0, 0 ], 1);
        TinyAssertions.assertContent(editor, '<p>a</p>');
      });

      it(`TINY-8729: should delete selected content when cef block is at the start and at the end after ${label} is pressed`, () => {
        const editor = hook.editor();
        editor.setContent('<p contenteditable="false">CEF</p><p>abc</p><p contenteditable="false">CEF</p>');
        // actual content: <p data-mce-caret="before"></p><p contenteditable="false">CEF</p><p>abc</p><p contenteditable="false">CEF</p>
        TinySelections.setSelection(editor, [ 0 ], 0, [], 4);
        TinyContentActions.keystroke(editor, key());
        TinyAssertions.assertContent(editor, '');
      });
    });
  });

  context('inline cef is at the start/end of the content and covered with the selection', () => {
    applyForDeleteAndBackspace(({ label, key }) => {
      it(`TINY-8729: should delete selected content when inline cef is at the start and ${label} is pressed`, () => {
        const editor = hook.editor();
        editor.setContent('<p><span contenteditable="false">CEF</span>abc</p>');
        // actual content: <p>&#xFEFF<span contenteditable="false">CEF</span>abc</p>
        TinySelections.setSelection(editor, [ 0 ], 0, [ 0, 2 ], 2);
        TinyContentActions.keystroke(editor, key());
        TinyAssertions.assertCursor(editor, [ 0 ], 0);
        TinyAssertions.assertContent(editor, '<p>c</p>');
      });

      it(`TINY-8729: should delete selected content when inline cef is at the end and ${label} is pressed`, () => {
        const editor = hook.editor();
        editor.setContent('<p>abc<span contenteditable="false">CEF</span></p>');
        // actual content: <p>&#xFEFF<span contenteditable="false">CEF</span>abc</p>
        TinySelections.setSelection(editor, [ 0, 0 ], 1, [ 0 ], 2);
        TinyContentActions.keystroke(editor, key());
        TinyAssertions.assertCursor(editor, [ 0 ], 1);
        TinyAssertions.assertContent(editor, '<p>a</p>');
      });

      it(`TINY-8729: should delete selected content when inline cef is at the start and at the end after ${label} is pressed`, () => {
        const editor = hook.editor();
        editor.setContent('<p><span contenteditable="false">CEF</span>abc<span contenteditable="false">CEF</span></p>');
        // actual content: <p>&#xFEFF<span contenteditable="false">CEF</span>abc<span contenteditable="false">CEF</span></p>
        TinySelections.setSelection(editor, [ 0 ], 0, [ 0 ], 4);
        TinyContentActions.keystroke(editor, key());
        TinyAssertions.assertCursor(editor, [ 0 ], 0);
        TinyAssertions.assertContent(editor, '');
      });
    });
  });

  context('Cleaning up after rng.deleteContents call', () => {
    applyForDeleteAndBackspace(({ label, key }) => {
      it(`TINY-8729: should clean up empty nodes and padd empty block with bogus br when ${label} is pressed`, () => {
        const editor = hook.editor();
        editor.setContent('<p><strong>W</strong>elcom<strong>e</strong></p><p contenteditable="false">CEF</p>');
        TinySelections.setSelection(editor, [ 0, 0, 0 ], 0, [ ], 2);
        TinyContentActions.keystroke(editor, key());
        // it should remove empty  <p><strong></strong></p> nodes
        TinyAssertions.assertRawContent(editor, '<p><br data-mce-bogus="1"></p>');
        TinyAssertions.assertCursor(editor, [ 0 ], 0);
      });

      it(`TINY-8729: should delete selected content and padd empty list item with bogus br when ${label} is pressed`, () => {
        const editor = hook.editor();
        editor.setContent('<ul><li><span contenteditable="false">CEF</span></li></ul>');
        // actual content: <ul><li>&#xFEFF<span contenteditable="false">CEF</span></li></ul>
        TinySelections.setSelection(editor, [ 0, 0, 0 ], 0, [ 0, 0 ], 2);
        TinyContentActions.keystroke(editor, key());
        TinyAssertions.assertRawContent(editor, '<ul><li><br data-mce-bogus="1"></li></ul>');
        TinyAssertions.assertCursor(editor, [ 0, 0 ], 0);
      });

      it(`TINY-8877: should delete when all content is selected and add back the forced root block when ${label} is pressed`, () => {
        const editor = hook.editor();
        editor.setContent('<p contenteditable="false">CEF</p><p>Second line</p><p contenteditable="false">CEF</p>');
        editor.execCommand('SelectAll');
        TinyContentActions.keystroke(editor, key());
        TinyAssertions.assertRawContent(editor, '<p><br data-mce-bogus="1"></p>');
        TinyAssertions.assertCursor(editor, [ 0 ], 0);
      });
    });
  });

  context('delete inside noneditables', () => {
    applyForDeleteAndBackspace(({ label, key }) => {
      it(`TINY-9477: should not delete anything between noneditables when ${label} is pressed`, () => {
        const editor = hook.editor();
        const initialContent = '<div contenteditable="false"><p>a</p><p>b</p></div>';
        editor.setContent(initialContent);
        TinySelections.setSelection(editor, [ 1, 0, 0 ], 0, [ 1, 1, 0 ], 1);
        TinyContentActions.keystroke(editor, key());
        TinyAssertions.assertSelection(editor, [ 0, 0, 0 ], 0, [ 0, 1, 0 ], 1);
        TinyAssertions.assertContent(editor, initialContent);
      });

      it(`TINY-9477: should not delete anything between editables in a noneditable root when ${label} is pressed`, () => {
        TinyState.withNoneditableRootEditor(hook.editor(), (editor) => {
          const initialContent = '<p>a</p><p>b</p>';
          editor.setContent(initialContent);
          TinySelections.setSelection(editor, [ 0, 0 ], 0, [ 1, 0 ], 1);
          TinyContentActions.keystroke(editor, key());
          TinyAssertions.assertSelection(editor, [ 0, 0 ], 0, [ 1, 0 ], 1);
          TinyAssertions.assertContent(editor, initialContent);
        });
      });

      it(`TINY-10011: should not delete empty CET in a noneditable root when ${label} is pressed`, () => {
        TinyState.withNoneditableRootEditor(hook.editor(), (editor) => {
          const initialContent = '<div contenteditable="true">&nbsp;</div>';
          editor.setContent(initialContent);
          TinySelections.setCursor(editor, [ 0 ], 0);
          TinyContentActions.keystroke(editor, key());
          TinyAssertions.assertCursor(editor, [ 0 ], 0);
          TinyAssertions.assertContent(editor, initialContent);
        });
      });

      it(`TINY-10010: should not delete empty CET in a table cell and noneditable root when ${label} is pressed`, () => {
        TinyState.withNoneditableRootEditor(hook.editor(), (editor) => {
          const initialContent = `
            <table style="border-collapse: collapse; width: 100%;" border="1">
              <tbody>
              <tr>
                <td>
                  <div contenteditable="true" style="border: 2px solid red"></div>
                </td>
                <td>&nbsp;</td>
              </tr>
              </tbody>
            </table>`;
          editor.setContent(initialContent);
          TinySelections.setCursor(editor, [ 0, 0, 0, 0, 0 ], 0);
          TinyContentActions.keystroke(editor, key());
          Assertions.assertPresence(
            'empty CET should not be deleted from the table cell',
            {
              'td div[contenteditable="true"]': 1,
            },
            TinyDom.body(editor)
          );
        });
      });

      it(`TINY-10011: should delete empty CET in a editable root when ${label} is pressed`, () => {
        const editor = hook.editor();
        editor.setContent('<div contenteditable="true">&nbsp;</div>');
        TinySelections.setCursor(editor, [ 0 ], 0);
        TinyContentActions.keystroke(editor, key());
        TinyAssertions.assertCursor(editor, [ 0 ], 0);
        TinyAssertions.assertContent(editor, '');
      });
    });
  });
});
