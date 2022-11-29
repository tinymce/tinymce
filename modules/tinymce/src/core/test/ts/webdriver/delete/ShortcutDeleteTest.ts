import { ApproxStructure, RealKeys } from '@ephox/agar';
import { before, describe, it } from '@ephox/bedrock-client';
import { PlatformDetection } from '@ephox/sand';
import { TinyAssertions, TinyHooks, TinySelections } from '@ephox/wrap-mcagar';

import Editor from 'tinymce/core/api/Editor';
import * as InlineFormatDelete from 'tinymce/core/delete/InlineFormatDelete';

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

  const assertStructureAndSelectionFormattedWord = (editor: Editor): void => {
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
                                  'data-mce-bogus': str.is('1')
                                }
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
                      'data-mce-bogus': str.is('1')
                    }
                  })
                ]
            })
          ]
        });
      })
    );
    const selPath = browser.isFirefox() ? [ 0, 0, 0, 0, 0, 0 ] : [ 0, 0, 0 ];
    TinyAssertions.assertSelection(editor, selPath, 0, selPath, 0);
  };

  const assertContentDeletionThenTyping = (editor: Editor): void =>
    TinyAssertions.assertContent(editor, browser.isFirefox()
      ? '<p><span style="text-decoration: underline;">d</span></p>'
      : '<p>d</p>');

  const ctrlModifier: BackspaceDeleteModifier = os.isMacOS() ? { alt: true } : { ctrl: true };

  it('Ctrl/Alt + Backspace at the end of a formatted word', async () => {
    const editor = hook.editor();
    editor.setContent('<p><strong><em><span style="text-decoration: underline;">abc</span></em></strong></p>');
    TinySelections.setCursor(editor, [ 0, 0, 0, 0, 0 ], 3);
    await doBackspaceDelete(editor, 'Backspace', ctrlModifier);
    assertStructureAndSelectionFormattedWord(editor);
  });

  it('Ctrl/Alt + Delete at the start of a formatted word', async () => {
    const editor = hook.editor();
    editor.setContent('<p><strong><em><span style="text-decoration: underline;">abc</span></em></strong></p>');
    TinySelections.setCursor(editor, [ 0, 0, 0, 0, 0 ], 0);
    await doBackspaceDelete(editor, 'Delete', ctrlModifier);
    assertStructureAndSelectionFormattedWord(editor);
  });

  it('TINY-9302: Ctrl/Alt + Backspace at the end of an underlined word then typing will not produce unexpected formats', async () => {
    const editor = hook.editor();
    editor.setContent('<p><span style="text-decoration: underline;">abc</span></p>');
    TinySelections.setCursor(editor, [ 0, 0, 0 ], 3);
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
});
