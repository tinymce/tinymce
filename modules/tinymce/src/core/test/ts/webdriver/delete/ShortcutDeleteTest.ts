import { ApproxStructure, RealKeys } from '@ephox/agar';
import { context, describe, it } from '@ephox/bedrock-client';
import { PlatformDetection } from '@ephox/sand';
import { TinyAssertions, TinyHooks, TinySelections } from '@ephox/wrap-mcagar';

import Editor from 'tinymce/core/api/Editor';

describe('webdriver.tinymce.core.delete.ShortcutDeleteTest', () => {
  const hook = TinyHooks.bddSetupLight<Editor>({
    base_url: '/project/tinymce/js/tinymce',
    indent: false
  }, [], true);

  context('Ranged backspace/delete formatted elements without selection using keyboard shortcuts', () => {
    const platform = PlatformDetection.detect();
    const os = platform.os;
    const browser = platform.browser;

    it('Ctrl/Alt + Backspace a formatted word', async () => {
      const modifiers = os.isMacOS() ? { alt: true } : { ctrl: true };
      const editor = hook.editor();
      editor.setContent('<p><strong><em><span style="text-decoration: underline;">abc</span></em></strong></p>');
      TinySelections.setCursor(editor, [ 0, 0, 0, 0, 0 ], 3);
      await RealKeys.pSendKeysOn('iframe => body', [ RealKeys.combo(modifiers, 'Backspace') ]);
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
    });
  });
});
