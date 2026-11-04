import { ApproxStructure, RealKeys, type StructAssert, Waiter } from '@ephox/agar';
import { beforeEach, describe, it } from '@ephox/bedrock-client';
import { Unicode } from '@ephox/katamari';
import { TinyAssertions, TinyHooks, TinySelections, TinyUiActions } from '@ephox/wrap-mcagar';
import { assert } from 'chai';

import type Editor from 'tinymce/core/api/Editor';
import NonbreakingPlugin from 'tinymce/plugins/nonbreaking/Plugin';
import VisualCharsPlugin from 'tinymce/plugins/visualchars/Plugin';

describe('webdriver.tinymce.plugins.nonbreaking.NonbreakingVisualCharsTypingTest', () => {
  // Note: Uses RealKeys, so needs a browser. Headless won't work.
  const hook = TinyHooks.bddSetup<Editor>({
    plugins: 'nonbreaking visualchars',
    toolbar: 'nonbreaking visualchars',
    visualchars_default_state: true,
    base_url: '/project/tinymce/js/tinymce'
  }, [ NonbreakingPlugin, VisualCharsPlugin ], true);

  // Webdriver resolves before the browser has applied the keys, and visualchars re-wraps the content 300ms after the
  // first keydown, dropping the zero-width space and wrapping any typed nbsp in a bogus span
  const pAssertSettledContentStructure = (editor: Editor, expected: StructAssert) =>
    Waiter.pTryUntil('Wait for the typed text to be applied', () => TinyAssertions.assertContentStructure(editor, expected));

  const nbspWrap = (s: ApproxStructure.StructApi, str: ApproxStructure.StringApi, arr: ApproxStructure.ArrayApi) => s.element('span', {
    classes: [ arr.has('mce-nbsp-wrap'), arr.has('mce-nbsp') ],
    children: [ s.text(str.is(Unicode.nbsp)) ]
  });

  const visualNbsp = (s: ApproxStructure.StructApi, str: ApproxStructure.StringApi, arr: ApproxStructure.ArrayApi) => s.element('span', {
    classes: [ arr.has('mce-nbsp') ],
    attrs: { 'data-mce-bogus': str.is('1') },
    children: [ s.text(str.is(Unicode.nbsp)) ]
  });

  const clickNbspToolbarButton = (editor: Editor) => TinyUiActions.clickOnToolbar(editor, 'button[aria-label="Nonbreaking space"]');

  beforeEach(() => {
    const editor = hook.editor();
    editor.setContent('');
  });

  it('TINY-3647: Click on the nbsp button then type some text, and assert content is correct', async () => {
    const editor = hook.editor();
    clickNbspToolbarButton(editor);
    await RealKeys.pSendKeysOn('iframe => body', [ RealKeys.text('test') ]);
    await pAssertSettledContentStructure(editor, ApproxStructure.build((s, str, arr) => s.element('body', {
      children: [
        s.element('p', {
          children: [
            nbspWrap(s, str, arr),
            s.text(str.is('test'))
          ]
        })
      ]
    })));
  });

  it('TINY-3647: Add text to editor, click on the nbsp button, and assert content is correct', () => {
    const editor = hook.editor();
    editor.setContent('test');
    TinySelections.setCursor(editor, [ 0, 0 ], 4);
    clickNbspToolbarButton(editor);
    TinyAssertions.assertContentStructure(editor, ApproxStructure.build((s, str, arr) => s.element('body', {
      children: [
        s.element('p', {
          children: [
            s.text(str.is('test')),
            nbspWrap(s, str, arr),
            s.text(str.is(Unicode.zeroWidth))
          ]
        })
      ]
    })));
  });

  it('TINY-3647: Add content to editor, click on the nbsp button then type some text, and assert content is correct', async () => {
    const editor = hook.editor();
    editor.setContent('test');
    TinySelections.setCursor(editor, [ 0, 0 ], 4);
    clickNbspToolbarButton(editor);
    await RealKeys.pSendKeysOn('iframe => body', [ RealKeys.text('test') ]);
    await pAssertSettledContentStructure(editor, ApproxStructure.build((s, str, arr) => s.element('body', {
      children: [
        s.element('p', {
          children: [
            s.text(str.is('test')),
            nbspWrap(s, str, arr),
            s.text(str.is('test'))
          ]
        })
      ]
    })));
  });

  it('TINY-3647: Click on the nbsp button then type a space, and assert content is correct', async () => {
    const editor = hook.editor();
    clickNbspToolbarButton(editor);
    await RealKeys.pSendKeysOn('iframe => body', [ RealKeys.text(' ') ]);
    await pAssertSettledContentStructure(editor, ApproxStructure.build((s, str, arr) => s.element('body', {
      children: [
        s.element('p', {
          children: [
            nbspWrap(s, str, arr),
            visualNbsp(s, str, arr)
          ]
        })
      ]
    })));
  });

  it('TINY-3647: Add text to editor, click on the nbsp button and add content plus a space, and assert content is correct', async () => {
    const editor = hook.editor();
    editor.setContent('test');
    TinySelections.setCursor(editor, [ 0, 0 ], 4);
    clickNbspToolbarButton(editor);
    TinyAssertions.assertContentStructure(editor, ApproxStructure.build((s, str, arr) => s.element('body', {
      children: [
        s.element('p', {
          children: [
            s.text(str.is('test')),
            nbspWrap(s, str, arr),
            s.text(str.is(Unicode.zeroWidth))
          ]
        })
      ]
    })));
    await RealKeys.pSendKeysOn('iframe => body', [ RealKeys.text('test ') ]);
    await pAssertSettledContentStructure(editor, ApproxStructure.build((s, str, arr) => s.element('body', {
      children: [
        s.element('p', {
          children: [
            s.text(str.is('test')),
            nbspWrap(s, str, arr),
            s.text(str.is('test')),
            visualNbsp(s, str, arr)
          ]
        })
      ]
    })));
  });

  it('TINY-3647: Add text to editor, click on the nbsp button and add content plus a space, repeat, and assert content is correct', async () => {
    const editor = hook.editor();
    editor.setContent('test');
    TinySelections.setCursor(editor, [ 0, 0 ], 4);
    clickNbspToolbarButton(editor);
    TinyAssertions.assertContentStructure(editor, ApproxStructure.build((s, str, arr) => s.element('body', {
      children: [
        s.element('p', {
          children: [
            s.text(str.is('test')),
            nbspWrap(s, str, arr),
            s.text(str.is(Unicode.zeroWidth))
          ]
        })
      ]
    })));
    await RealKeys.pSendKeysOn('iframe => body', [ RealKeys.text('test ') ]);
    await pAssertSettledContentStructure(editor, ApproxStructure.build((s, str, arr) => s.element('body', {
      children: [
        s.element('p', {
          children: [
            s.text(str.is('test')),
            nbspWrap(s, str, arr),
            s.text(str.is('test')),
            visualNbsp(s, str, arr)
          ]
        })
      ]
    })));
    await RealKeys.pSendKeysOn('iframe => body', [ RealKeys.text('test ') ]);
    // Chrome turns the earlier trailing nbsp into a plain space once text follows it and Firefox keeps it, so check the
    // serialised content rather than the split text nodes
    const nbspWrapHtml = '<span class="mce-nbsp-wrap mce-nbsp" contenteditable="false">&nbsp;</span>';
    await Waiter.pTryUntil('Wait for the typed text to be applied', () => assert.include([
      `<p>test${nbspWrapHtml}test test&nbsp;</p>`,
      `<p>test${nbspWrapHtml}test&nbsp;test&nbsp;</p>`
    ], editor.getContent()));
  });
});
