import { ApproxStructure, RealKeys } from '@ephox/agar';
import { before, describe, it } from '@ephox/bedrock-client';
import { PlatformDetection } from '@ephox/sand';
import { TinyAssertions, TinyHooks, TinySelections } from '@ephox/wrap-mcagar';

import Editor from 'tinymce/core/api/Editor';
import * as InlineFormatDelete from 'tinymce/core/delete/InlineFormatDelete';
import * as Zwsp from 'tinymce/core/text/Zwsp';

type BackspaceDeleteModifier = { ctrl: true } | { alt: true } | { meta: true };

describe('webdriver.tinymce.core.delete.ShortcutDeleteTest', () => {
  const hook = TinyHooks.bddSetupLight<Editor>({
    base_url: '/project/tinymce/js/tinymce',
    indent: false
  }, [], true);
  const platform = PlatformDetection.detect();
  const os = platform.os;
  const browser = platform.browser;

  before(function () {
    // Safari doesn't automatically trigger keyup override in tests
    if (browser.isSafari()) {
      this.skip();
    }
  });

  const doBackspaceDelete = async (editor: Editor, deletionKey: 'Backspace' | 'Delete', modifiers: BackspaceDeleteModifier): Promise<void> => {
    await RealKeys.pSendKeysOn('iframe => body', [ RealKeys.combo(modifiers, deletionKey) ]);
    InlineFormatDelete.refreshCaret(editor);
  };

  const assertStructureAndCursorFormattedWord = (editor: Editor): void => {
    TinyAssertions.assertContentStructure(editor,
      ApproxStructure.build((s, str, _arr) => {
        return s.element('body', {
          children: [
            s.element('p', {
              // firefox preserves formats
              children: browser.isFirefox()
                ? [
                  s.element('strong', {
                    children: [
                      s.element('em', {
                        children: [
                          s.element('span', {
                            attrs: {
                              style: str.is('text-decoration: underline;')
                            },
                            children: [
                              s.element('span', {
                                attrs: {
                                  'id': str.is('_mce_caret'),
                                  'data-mce-bogus': str.is('1'),
                                  'data-mce-type': str.is('format-caret')
                                },
                                children: [
                                  s.text(str.is(Zwsp.ZWSP))
                                ]
                              })
                            ]
                          })
                        ]
                      })
                    ]
                  })
                ]
                : [
                  s.element('span', {
                    attrs: {
                      'id': str.is('_mce_caret'),
                      'data-mce-bogus': str.is('1'),
                      'data-mce-type': str.is('format-caret')
                    },
                    children: [
                      s.text(str.is(Zwsp.ZWSP))
                    ]
                  })
                ]
            })
          ]
        });
      })
    );
    const selPath = browser.isFirefox() ? [ 0, 0, 0, 0, 0, 0 ] : [ 0, 0, 0 ];
    TinyAssertions.assertCursor(editor, selPath, 0);
  };

  const assertStructureAndCursorFormattedCaret = (editor: Editor): void => {
    TinyAssertions.assertContentStructure(editor,
      ApproxStructure.build((s, str, _arr) => {
        return s.element('body', {
          children: [
            s.element('p', {
              children: [
                s.element('span', {
                  attrs: {
                    'id': str.is('_mce_caret'),
                    'data-mce-bogus': str.is('1'),
                    'data-mce-type': str.is('format-caret')
                  },
                  children: [
                    s.element('strong', {
                      children: [
                        s.element('em', {
                          children: [
                            s.element('span', {
                              attrs: {
                                style: str.is('text-decoration: underline;')
                              },
                              children: [
                                s.text(str.is(Zwsp.ZWSP))
                              ]
                            })
                          ]
                        })
                      ]
                    })
                  ]
                })
              ]
            })
          ]
        });
      })
    );
    TinyAssertions.assertCursor(editor, [ 0, 0, 0, 0, 0, 0 ], 0);
  };

  const assertContentDeletionThenTyping = (editor: Editor): void =>
    TinyAssertions.assertContent(editor, browser.isFirefox()
      ? '<p><span style="text-decoration: underline;">d</span></p>'
      : '<p>d</p>');

  const ctrlModifier: BackspaceDeleteModifier = os.isMacOS() ? { alt: true } : { ctrl: true };

  it('TINY-9302: Ctrl/Alt + Backspace at the end of a formatted word', async () => {
    const editor = hook.editor();
    editor.setContent('<p><strong><em><span style="text-decoration: underline;">abc</span></em></strong></p>');
    TinySelections.setCursor(editor, [ 0, 0, 0, 0, 0 ], 'abc'.length);
    await doBackspaceDelete(editor, 'Backspace', ctrlModifier);
    assertStructureAndCursorFormattedWord(editor);
  });

  it('TINY-9302: Ctrl/Alt + Delete at the start of a formatted word', async () => {
    const editor = hook.editor();
    editor.setContent('<p><strong><em><span style="text-decoration: underline;">abc</span></em></strong></p>');
    TinySelections.setCursor(editor, [ 0, 0, 0, 0, 0 ], 0);
    await doBackspaceDelete(editor, 'Delete', ctrlModifier);
    assertStructureAndCursorFormattedWord(editor);
  });

  it('TINY-9302: Ctrl/Alt + Backspace at the end of an underlined word then typing will not produce unexpected formats', async () => {
    const editor = hook.editor();
    editor.setContent('<p><span style="text-decoration: underline;">abc</span></p>');
    TinySelections.setCursor(editor, [ 0, 0, 0 ], 'abc'.length);
    await doBackspaceDelete(editor, 'Backspace', ctrlModifier);
    await RealKeys.pSendKeysOn('iframe => body', [ RealKeys.text('d') ]);
    assertContentDeletionThenTyping(editor);
  });

  it('TINY-9302: Ctrl/Alt + Delete at the end of an underlined word then typing will not produce unexpected formats', async () => {
    const editor = hook.editor();
    editor.setContent('<p><span style="text-decoration: underline;">abc</span></p>');
    TinySelections.setCursor(editor, [ 0, 0, 0 ], 0);
    await doBackspaceDelete(editor, 'Delete', ctrlModifier);
    await RealKeys.pSendKeysOn('iframe => body', [ RealKeys.text('d') ]);
    assertContentDeletionThenTyping(editor);
  });

  it('TINY-9302: Nested carets are not created when an ancestor caret already exists', async () => {
    const editor = hook.editor();
    editor.setContent('<p>abc</p>');
    TinySelections.setCursor(editor, [ 0, 0 ], 'abc'.length);
    await doBackspaceDelete(editor, 'Backspace', ctrlModifier);
    TinyAssertions.assertContentStructure(editor,
      ApproxStructure.build((s, str, _arr) => {
        return s.element('body', {
          children: [
            s.element('p', {
              children: [
                s.element('span', {
                  attrs: {
                    'id': str.is('_mce_caret'),
                    'data-mce-bogus': str.is('1'),
                    'data-mce-type': str.is('format-caret')
                  },
                  children: [
                    s.text(str.is(Zwsp.ZWSP))
                  ]
                })
              ]
            })
          ]
        });
      })
    );
    TinyAssertions.assertCursor(editor, [ 0, 0, 0 ], 0);

    // apply formats within caret so that it becomes an ancestor caret relative to
    // selection start after deletion
    editor.execCommand('Underline');
    editor.execCommand('Italic');
    editor.execCommand('Bold');
    assertStructureAndCursorFormattedCaret(editor);

    // type a character for deletion
    await RealKeys.pSendKeysOn('iframe => body', [ RealKeys.text('d') ]);
    TinyAssertions.assertContent(editor, '<p><strong><em><span style="text-decoration: underline;">d</span></em></strong></p>');

    // assert that a new caret is not created at cursor after deletion
    await doBackspaceDelete(editor, 'Backspace', ctrlModifier);
    assertStructureAndCursorFormattedCaret(editor);
  });
});
