import { ApproxStructure, Keyboard, Keys } from '@ephox/agar';
import { describe, it } from '@ephox/bedrock-client';
import { Unicode } from '@ephox/katamari';
import { TinyAssertions, TinyContentActions, TinyDom, TinyHooks, TinySelections } from '@ephox/wrap-mcagar';

import Editor from 'tinymce/core/api/Editor';
import Env from 'tinymce/core/api/Env';
import NoneditablePlugin from 'tinymce/plugins/noneditable/Plugin';
import Theme from 'tinymce/themes/silver/Theme';

describe('browser.tinymce.core.delete.CefDeleteNoneditableTest', () => {
  const hook = TinyHooks.bddSetupLight<Editor>({
    base_url: '/project/tinymce/js/tinymce',
    plugins: 'noneditable'
  }, [ Theme, NoneditablePlugin ], true);

  it('TINY-3868: Should not backspace cef inside cef with ranged selection', () => {
    const editor = hook.editor();
    editor.setContent('<div class="mceNonEditable"><span class="mceNonEditable">a</span> b</div><p>c</p>');
    TinySelections.select(editor, 'div.mceNonEditable', [ 0 ]);
    TinyContentActions.keystroke(editor, Keys.backspace());
    TinyAssertions.assertSelection(editor, [ 0 ], 0, [ 0 ], 1);
    TinyAssertions.assertContentStructure(editor,
      ApproxStructure.build((s, str, arr) => s.element('body', {
        children: [
          s.element('div', {
            children: [
              s.element('span', {
                children: [
                  s.text(str.is('a'))
                ]
              }),
              s.text(str.is(' b'))
            ]
          }),
          s.element('p', {
            children: [
              s.text(str.is('c'))
            ]
          }),
          s.element('div', {
            classes: [ arr.has('mce-offscreen-selection') ]
          })
        ]
      }))
    );
  });

  it('TINY-3868: Should not delete cef inside cef with ranged selection', () => {
    const editor = hook.editor();
    editor.setContent('<div class="mceNonEditable"><span class="mceNonEditable">a</span> b</div><p>c</p>');
    TinySelections.select(editor, 'div.mceNonEditable', [ 0 ]);
    TinyContentActions.keystroke(editor, Keys.delete());
    TinyAssertions.assertSelection(editor, [ 0 ], 0, [ 0 ], 1);
    TinyAssertions.assertContentStructure(editor,
      ApproxStructure.build((s, str, arr) => s.element('body', {
        children: [
          s.element('div', {
            children: [
              s.element('span', {
                children: [
                  s.text(str.is('a'))
                ]
              }),
              s.text(str.is(' b'))
            ]
          }),
          s.element('p', {
            children: [
              s.text(str.is('c'))
            ]
          }),
          s.element('div', {
            classes: [ arr.has('mce-offscreen-selection') ]
          })
        ]
      }))
    );
  });

  it('TINY-3868: Should backspace cef inside cet with collapsed selection after inner cef', () => {
    const editor = hook.editor();
    editor.setContent('<div class="mceNonEditable"><span class="mceEditable"><span class="mceNonEditable">az</span> b</span> c</div><p>d</p>');
    TinySelections.select(editor, 'div>span', [ 0 ]);
    Keyboard.sKeydown(TinyDom.document(editor), Keys.right(), { });
    TinyContentActions.keystroke(editor, Keys.backspace());
    TinyAssertions.assertSelection(editor, [ 0, 0, 0 ], 0, [ 0, 0, 0 ], 0);
    TinyAssertions.assertContentStructure(editor,
      ApproxStructure.build((s, str, _arr) => s.element('body', {
        children: [
          s.element('div', {
            children: [
              s.element('span', {
                children: [
                  s.text(str.is(Unicode.nbsp + 'b'))
                ]
              }),
              s.text(str.is(' c'))
            ]
          }),
          s.element('p', {
            children: [
              s.text(str.is('d'))
            ]
          })
        ]
      }))
    );
  });

  // IE selects the offscreen cloned element somehow, which causes all kinds of problems. So skip.
  const shouldSkip = Env.browser.isIE();
  it('TINY-3868: Should not backspace cef inside cef with collapsed selection after inner cef', function () {
    if (shouldSkip) {
      this.skip();
    }
    const editor = hook.editor();
    editor.setContent('<div class="mceNonEditable"><span class="mceNonEditable">a</span> b</div><p>c</p>');
    TinySelections.select(editor, 'div.mceNonEditable', [ 0 ]);
    TinyContentActions.keydown(editor, Keys.right());
    TinyContentActions.keystroke(editor, Keys.backspace());
    TinyAssertions.assertSelection(editor, [ 0, 1 ], 1, [ 0, 1 ], 1);
    TinyAssertions.assertContentStructure(editor,
      ApproxStructure.build((s, str, _arr) => s.element('body', {
        children: [
          s.element('div', {
            children: [
              s.element('span', {
                children: [
                  s.text(str.is('a'))
                ]
              }),
              s.text(str.is(Unicode.zeroWidth)),
              s.text(str.is(' b'))
            ]
          }),
          s.element('p', {
            children: [
              s.text(str.is('c'))
            ]
          })
        ]
      }))
    );
  });

  it('TINY-3868: Should not delete cef inside cef with collapsed selection before inner cef', function () {
    if (shouldSkip) {
      this.skip();
    }
    const editor = hook.editor();
    editor.setContent('<div class="mceNonEditable"><span class="mceNonEditable">a</span> b</div><p>c</p>');
    TinySelections.select(editor, 'div.mceNonEditable', [ 0 ]);
    TinyContentActions.keydown(editor, Keys.left());
    TinyContentActions.keystroke(editor, Keys.delete());
    TinyAssertions.assertSelection(editor, [ 0, 0 ], 0, [ 0, 0 ], 0);
    TinyAssertions.assertContentStructure(editor,
      ApproxStructure.build((s, str, _arr) => s.element('body', {
        children: [
          s.element('div', {
            children: [
              s.text(str.is(Unicode.zeroWidth)),
              s.element('span', {
                children: [
                  s.text(str.is('a'))
                ]
              }),
              s.text(str.is(' b'))
            ]
          }),
          s.element('p', {
            children: [
              s.text(str.is('c'))
            ]
          })
        ]
      }))
    );
  });
});
