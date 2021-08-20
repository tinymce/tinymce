import { ApproxStructure, Keys } from '@ephox/agar';
import { describe, it } from '@ephox/bedrock-client';
import { TinyAssertions, TinyContentActions, TinyHooks, TinySelections } from '@ephox/wrap-mcagar';

import Editor from 'tinymce/core/api/Editor';
import Theme from 'tinymce/themes/silver/Theme';

describe('browser.tinymce.core.delete.CefDeleteTest', () => {
  const hook = TinyHooks.bddSetupLight<Editor>({
    base_url: '/project/tinymce/js/tinymce'
  }, [ Theme ], true);

  const fakeBackspaceKeyOnRange = (editor: Editor) => {
    editor.getDoc().execCommand('Delete', false, null);
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
});
