import { ApproxStructure, RealKeys } from '@ephox/agar';
import { beforeEach, describe, it } from '@ephox/bedrock-client';
import { Unicode } from '@ephox/katamari';
import { TinyAssertions, TinyHooks, TinySelections, TinyUiActions } from '@ephox/wrap-mcagar';

import Editor from 'tinymce/core/api/Editor';
import Env from 'tinymce/core/api/Env';
import Plugin from 'tinymce/plugins/nonbreaking/Plugin';

describe('webdriver.tinymce.plugins.nonbreaking.NonbreakingTypingTest', () => {
  // Note: Uses RealKeys, so needs a browser. Headless won't work.
  const hook = TinyHooks.bddSetup<Editor>({
    plugins: 'nonbreaking',
    toolbar: 'nonbreaking',
    nonbreaking_wrap: false,
    base_url: '/project/tinymce/js/tinymce'
  }, [ Plugin ]);

  const isFirefox = Env.browser.isFirefox();

  const clickNbspToolbarButton = (editor: Editor) => {
    TinyUiActions.clickOnToolbar(editor, 'button[aria-label="Nonbreaking space"]');
    editor.focus();
  };

  beforeEach(() => {
    const editor = hook.editor();
    editor.setContent('');
    editor.focus();
  });

  it('TBA: Click on the nbsp button then type some text, and assert content is correct', async () => {
    const editor = hook.editor();
    clickNbspToolbarButton(editor);
    await RealKeys.pSendKeysOn('iframe => body => p', [ RealKeys.text('word') ]);
    TinyAssertions.assertContentStructure(editor, ApproxStructure.build((s, str) => {
      return s.element('body', {
        children: [
          s.element('p', {
            children: [
              s.text(str.is(Unicode.nbsp + 'word'))
            ]
          })
        ]
      });
    }));
  });

  it('TBA: Add text to editor, click on the nbsp button, and assert content is correct', () => {
    const editor = hook.editor();
    editor.setContent('test');
    TinySelections.setCursor(editor, [ 0, 0 ], 4);
    clickNbspToolbarButton(editor);
    TinyAssertions.assertContentStructure(editor, ApproxStructure.build((s, str) => {
      return s.element('body', {
        children: [
          s.element('p', {
            children: [
              s.text(str.is('test' + Unicode.nbsp))
            ]
          })
        ]
      });
    }));
  });

  it('TBA: Add content to editor, click on the nbsp button then type some text, and assert content is correct', async () => {
    const editor = hook.editor();
    editor.setContent('word');
    TinySelections.setCursor(editor, [ 0, 0 ], 4);
    clickNbspToolbarButton(editor);
    await RealKeys.pSendKeysOn('iframe => body => p', [ RealKeys.text('word') ]);
    TinyAssertions.assertContentStructure(editor, ApproxStructure.build((s, str) => {
      return s.element('body', {
        children: [
          s.element('p', {
            children: [
              s.text(str.is('word word'))
            ]
          })
        ]
      });
    }));
  });

  it('TBA: Click on the nbsp button then type a space, and assert content is correct', async () => {
    const editor = hook.editor();
    clickNbspToolbarButton(editor);
    await RealKeys.pSendKeysOn('iframe => body => p', [ RealKeys.text(' ') ]);
    TinyAssertions.assertContentStructure(editor, ApproxStructure.build((s, str) => {
      return s.element('body', {
        children: [
          s.element('p', {
            children: [
              s.text(str.is(isFirefox ? Unicode.nbsp + ' ' : Unicode.nbsp + Unicode.nbsp))
            ].concat(isFirefox ? [ s.element('br', {}) ] : [])
          })
        ]
      });
    }));
  });

  it('TBA: Add text to editor, click on the nbsp button and add content plus a space, and assert content is correct', async () => {
    const editor = hook.editor();
    editor.setContent('word');
    TinySelections.setCursor(editor, [ 0, 0 ], 4);
    clickNbspToolbarButton(editor);
    await RealKeys.pSendKeysOn('iframe => body => p', [ RealKeys.text('word ') ]);
    TinyAssertions.assertContentStructure(editor, ApproxStructure.build((s, str) => {
      return s.element('body', {
        children: [
          s.element('p', {
            children: [
              s.text(str.is('word word' + Unicode.nbsp))
            ].concat(isFirefox ? [ s.element('br', {}) ] : [])
          })
        ]
      });
    }));
  });
});
