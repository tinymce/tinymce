import { ApproxStructure, RealKeys } from '@ephox/agar';
import { beforeEach, context, describe, it } from '@ephox/bedrock-client';
import { Arr } from '@ephox/katamari';
import { PlatformDetection } from '@ephox/sand';
import { TinyAssertions, TinyHooks, TinySelections } from '@ephox/wrap-mcagar';

import Editor from 'tinymce/core/api/Editor';
import { applyCaretFormat, removeCaretFormat } from 'tinymce/core/fmt/CaretFormat';
import * as Zwsp from 'tinymce/core/text/Zwsp';

describe('webdriver.tinymce.core.keyboard.SpaceKeyTest', () => {
  const hook = TinyHooks.bddSetupLight<Editor>({
    indent: false,
    base_url: '/project/tinymce/js/tinymce'
  }, []);

  const detect = PlatformDetection.detect().browser;
  const isSafari = detect.isSafari();
  const isFirefox = detect.isFirefox();

  const simulateComposing = (editor: Editor, updates: string[], end: string) => {
    const domElement = editor.getBody();
    editor.undoManager.typing = true;
    domElement.dispatchEvent(new window.CompositionEvent('compositionstart'));
    editor.dispatch('input', { isComposing: true, data: updates[0] } as InputEvent);
    Arr.foldl(updates, (acc, update) => {
      domElement.dispatchEvent(new window.CompositionEvent('compositionupdate', { data: acc + update }));
      return acc + update;
    }, '');
    domElement.dispatchEvent(new window.CompositionEvent('compositionupdate', { data: end }));

    editor.undoManager.ignore(() => {
      editor.insertContent(end);
    });
    domElement.dispatchEvent(new window.CompositionEvent('compositionend', { data: end }));
  };

  beforeEach(() => {
    hook.editor().focus();
  });

  context('Space key around inline boundary elements', () => {
    // TINY-10742: Skipping until unexpected <br> tag being added in Firefox is addressed.
    it.skip('TINY-8588: Add one space just before a block', async () => {
      const editor = hook.editor();
      editor.setContent('<p>s<span style="display: block;" contenteditable="false">a</span></p>');
      TinySelections.setCursor(editor, [ 0, 0 ], 1);
      await RealKeys.pSendKeysOn('iframe => body', [ RealKeys.text(' ') ]);
      if (isFirefox) {
        TinyAssertions.assertContent(editor, '<p>s&nbsp;<br><span style="display: block;" contenteditable="false">a</span></p>');
      } else {
        TinyAssertions.assertContent(editor, '<p>s&nbsp;<span style="display: block;" contenteditable="false">a</span></p>');
      }
    });

    // TINY-10742: Skipping until unexpected <br> tag being added in Firefox is addressed.
    it.skip('TINY-8588: Add two spaces just before a block', async () => {
      const editor = hook.editor();
      editor.setContent('<p>s<span style="display: block;" contenteditable="false">a</span></p>');
      TinySelections.setCursor(editor, [ 0, 0 ], 1);
      await RealKeys.pSendKeysOn('iframe => body', [ RealKeys.text(' ') ]);
      await RealKeys.pSendKeysOn('iframe => body', [ RealKeys.text(' ') ]);
      if (isSafari) { // Split due to normalization issue. See TINY-8833
        TinyAssertions.assertContent(editor, '<p>s &nbsp;<span style="display: block;" contenteditable="false">a</span></p>');
      } else if (isFirefox) { // Split due to normalization issue. See TINY-8833
        TinyAssertions.assertContent(editor, '<p>s&nbsp; <br><span style="display: block;" contenteditable="false">a</span></p>');
      } else {
        TinyAssertions.assertContent(editor, '<p>s&nbsp;&nbsp;<span style="display: block;" contenteditable="false">a</span></p>');
      }
    });

    // TINY-10742: Skipping until unexpected <br> tag being added in Firefox is addressed.
    it.skip('TINY-8588: Add one space before a block while in a span', async () => {
      const editor = hook.editor();
      editor.setContent('<p><span class="filler">s</span><span style="display: block;" contenteditable="false">a</span></p>');
      TinySelections.setCursor(editor, [ 0, 0, 0 ], 1);
      await RealKeys.pSendKeysOn('iframe => body', [ RealKeys.text(' ') ]);
      if (isFirefox) {
        TinyAssertions.assertContent(editor, '<p><span class="filler">s&nbsp;<br></span><span style="display: block;" contenteditable="false">a</span></p>');
      } else {
        TinyAssertions.assertContent(editor, '<p><span class="filler">s&nbsp;</span><span style="display: block;" contenteditable="false">a</span></p>');
      }
    });

    // TINY-10742: Skipping until unexpected <br> tag being added in Firefox is addressed.
    it.skip('TINY-8588: Add one space before a block inside a strong', async () => {
      const editor = hook.editor();
      editor.setContent('<p>s<strong><span contenteditable="false" style="display: block;">a</span></strong></p>');
      TinySelections.setCursor(editor, [ 0, 0 ], 1);
      await RealKeys.pSendKeysOn('iframe => body', [ RealKeys.text(' ') ]);
      if (isFirefox) {
        TinyAssertions.assertContent(editor, '<p>s&nbsp;<br><strong><span style="display: block;" contenteditable="false">a</span></strong></p>');
      } else {
        TinyAssertions.assertContent(editor, '<p>s&nbsp;<strong><span style="display: block;" contenteditable="false">a</span></strong></p>');
      }
    });

    it('TINY-8814: Add one space just after a block', async () => {
      const editor = hook.editor();
      editor.setContent('<p><span style="display: block;" contenteditable="false">a</span>s</p>');
      TinySelections.setCursor(editor, [ 0, 2 ], 0);
      await RealKeys.pSendKeysOn('iframe => body', [ RealKeys.text(' ') ]);
      TinyAssertions.assertContent(editor, '<p><span style="display: block;" contenteditable="false">a</span>&nbsp;s</p>');
    });

    it('TINY-8814: Add two spaces just after a block', async () => {
      const editor = hook.editor();
      editor.setContent('<p><span style="display: block;" contenteditable="false">a</span>s</p>');
      TinySelections.setCursor(editor, [ 0, 2 ], 0);
      await RealKeys.pSendKeysOn('iframe => body', [ RealKeys.text(' ') ]);
      await RealKeys.pSendKeysOn('iframe => body', [ RealKeys.text(' ') ]);
      TinyAssertions.assertContent(editor, '<p><span style="display: block;" contenteditable="false">a</span>&nbsp; s</p>');
    });

    it('TINY-8814: Add one space after a block while in a span', async () => {
      const editor = hook.editor();
      editor.setContent('<p><span style="display: block;" contenteditable="false">a</span><span class="filler">s</span></p>');
      TinySelections.setCursor(editor, [ 0, 2, 0 ], 0);
      await RealKeys.pSendKeysOn('iframe => body', [ RealKeys.text(' ') ]);
      TinyAssertions.assertContent(editor, '<p><span style="display: block;" contenteditable="false">a</span><span class="filler">&nbsp;s</span></p>');
    });

    it('TINY-8814: Add one space after a block inside a strong', async () => {
      const editor = hook.editor();
      editor.setContent('<p><strong><span contenteditable="false" style="display: block;">a</span></strong>s</p>');
      TinySelections.setCursor(editor, [ 0, 1 ], 0);
      await RealKeys.pSendKeysOn('iframe => body', [ RealKeys.text(' ') ]);
      TinyAssertions.assertContent(editor, '<p><strong><span style="display: block;" contenteditable="false">a</span></strong>&nbsp;s</p>');
    });

    it('TINY-9310: deleting a formatted part and then press space and then insert a char should insert the char in the correct place', async () => {
      const editor = hook.editor();
      editor.setContent('<p>a</p>');
      TinySelections.setCursor(editor, [ 0 ], 1);
      applyCaretFormat(editor, 'bold', {});
      await RealKeys.pSendKeysOn('iframe => body', [ RealKeys.text('b') ]);
      await RealKeys.pSendKeysOn('iframe => body', [ RealKeys.backspace() ]);

      TinyAssertions.assertContentStructure(editor, ApproxStructure.build((s, str) => {
        return s.element('body', {
          children: [
            s.element('p', {
              children: [
                s.text(str.is('a')),
                s.element('span', {
                  attrs: {
                    'id': str.is('_mce_caret'),
                    'data-mce-bogus': str.is('1')
                  },
                  children: [
                    s.element('strong', {
                      children: [
                        s.text(str.is(Zwsp.ZWSP))
                      ]
                    })
                  ]
                })
              ]
            })
          ]
        });
      }));

      await RealKeys.pSendKeysOn('iframe => body', [ RealKeys.text(' ') ]);
      await RealKeys.pSendKeysOn('iframe => body', [ RealKeys.text('c') ]);
      if (isFirefox) {
        TinyAssertions.assertContent(editor, '<p>a<strong> c</strong></p>');
      } else {
        TinyAssertions.assertContent(editor, '<p>a c</p>');
      }
    });

    it('TINY-10854: `&nbsp;`s should be converted to spaces when before or after there is an inline element', async () => {
      const editor = hook.editor();
      editor.setContent('<p>a</p>');
      TinySelections.setCursor(editor, [ 0 ], 1);
      await RealKeys.pSendKeysOn('iframe => body', [ RealKeys.text(' ') ]);

      applyCaretFormat(editor, 'bold', {});
      await RealKeys.pSendKeysOn('iframe => body', [ RealKeys.text('b') ]);
      await RealKeys.pSendKeysOn('iframe => body', [ RealKeys.text(' ') ]);

      removeCaretFormat(editor, 'bold', {});
      await RealKeys.pSendKeysOn('iframe => body', [ RealKeys.text(' ') ]);
      await RealKeys.pSendKeysOn('iframe => body', [ RealKeys.text('c') ]);
      await RealKeys.pSendKeysOn('iframe => body', [ RealKeys.text(' ') ]);
      TinyAssertions.assertContent(editor, '<p>a <strong>b&nbsp;</strong> c&nbsp;</p>');
    });

    it('TINY-10854: `&nbsp;`s should not be converted to spaces when it is at the start of an inline element', async () => {
      const editor = hook.editor();
      editor.setContent('<p>a </p>');
      TinySelections.setCursor(editor, [ 0 ], 1);
      await RealKeys.pSendKeysOn('iframe => body', [ RealKeys.text(' ') ]);

      applyCaretFormat(editor, 'bold', {});
      await RealKeys.pSendKeysOn('iframe => body', [ RealKeys.text(' ') ]);
      await RealKeys.pSendKeysOn('iframe => body', [ RealKeys.text('b') ]);
      await RealKeys.pSendKeysOn('iframe => body', [ RealKeys.text(' ') ]);

      removeCaretFormat(editor, 'bold', {});
      await RealKeys.pSendKeysOn('iframe => body', [ RealKeys.text(' ') ]);
      await RealKeys.pSendKeysOn('iframe => body', [ RealKeys.text('c') ]);
      await RealKeys.pSendKeysOn('iframe => body', [ RealKeys.text(' ') ]);
      TinyAssertions.assertContent(editor, '<p>a&nbsp;<strong> b&nbsp;</strong> c&nbsp;</p>');
    });

    it('TINY-10854: `&nbsp;`s should be converted to spaces when before or after there is an inline element (with composition)', async () => {
      const editor = hook.editor();
      editor.setContent('<p>a</p>');
      TinySelections.setCursor(editor, [ 0 ], 1);
      await RealKeys.pSendKeysOn('iframe => body', [ RealKeys.text(' ') ]);

      applyCaretFormat(editor, 'bold', {});
      // い -> Japanese hiragana for 'i'
      // ぬ -> Japanese hiragana for 'nu'
      // 犬 -> Japanese kanji for 'inu' (dog)
      simulateComposing(editor, [ 'い', 'ぬ' ], '犬');
      await RealKeys.pSendKeysOn('iframe => body', [ RealKeys.text(' ') ]);

      removeCaretFormat(editor, 'bold', {});
      await RealKeys.pSendKeysOn('iframe => body', [ RealKeys.text(' ') ]);
      // ね -> Japanese hiragana for 'ne'
      // こ -> Japanese hiragana for 'ko'
      // 猫 -> Japanese kanji for 'neko' (cat)
      simulateComposing(editor, [ 'ね', 'こ' ], '猫');
      await RealKeys.pSendKeysOn('iframe => body', [ RealKeys.text(' ') ]);
      TinyAssertions.assertContent(editor, '<p>a <strong>犬&nbsp;</strong> 猫&nbsp;</p>');
    });
  });
});
