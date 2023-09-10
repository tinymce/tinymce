import { ApproxStructure } from '@ephox/agar';
import { describe, it } from '@ephox/bedrock-client';
import { Unicode } from '@ephox/katamari';
import { TinyAssertions, TinyHooks, TinySelections, TinyUiActions } from '@ephox/wrap-mcagar';

import Editor from 'tinymce/core/api/Editor';

describe('browser.tinymce.themes.silver.editor.color.TextColorFormattingTest', () => {
  const selectors = {
    backcolorSplitButton: '[aria-label^="Background color"] > .tox-tbtn + .tox-split-button__chevron',
    forecolorSplitButton: '[aria-label^="Text color"] > .tox-tbtn + .tox-split-button__chevron'
  };

  const hook = TinyHooks.bddSetupLight<Editor>({
    toolbar: 'forecolor backcolor',
    base_url: '/project/tinymce/js/tinymce'
  }, [], true);

  const backcolorTitleStruct = ApproxStructure.build((s, str) =>
    s.element('body', {
      children: [
        s.element('p', {
          children: [
            s.element('span', {
              styles: {
                'background-color': str.is('rgb(224, 62, 45)')
              },
              children: [
                s.text(str.is('𢫕'))
              ]
            })
          ]
        })
      ]
    }));

  const forecolorTitleStruct = ApproxStructure.build((s, str) =>
    s.element('body', {
      children: [
        s.element('p', {
          children: [
            s.element('span', {
              styles: {
                color: str.is('rgb(224, 62, 45)')
              },
              children: [
                s.text(str.is('圓'))
              ]
            })
          ]
        })
      ]
    }));

  const forecolorStruct = ApproxStructure.build((s, str) =>
    s.element('body', {
      children: [
        s.element('p', {
          children: [
            s.text(str.is('Hello')),
            s.element('span', {
              styles: {
                color: str.is('rgb(53, 152, 219)')
              },
              children: [
                s.text(str.is(Unicode.nbsp))
              ]
            }),
            s.text(str.is('world'))
          ]
        })
      ]
    }));

  const forecolorTextStruct = ApproxStructure.build((s, str) =>
    s.element('body', {
      children: [
        s.element('p', {
          children: [
            s.element('span', {
              styles: {
                color: str.is('rgb(53, 152, 219)')
              },
              children: [
                s.text(str.is('Hello'))
              ]
            }),
            s.text(str.is(Unicode.nbsp + 'world'))
          ]
        })
      ]
    }));

  const backcolorStruct = ApproxStructure.build((s, str) =>
    s.element('body', {
      children: [
        s.element('p', {
          children: [
            s.text(str.is('Hello')),
            s.element('span', {
              styles: {
                'background-color': str.is('rgb(53, 152, 219)')
              },
              children: [
                s.text(str.is(Unicode.nbsp))
              ]
            }),
            s.text(str.is('world'))
          ]
        })
      ]
    }));

  it('TBA: Forecolor on non breaking space', async () => {
    const editor = hook.editor();
    editor.setContent(`Hello${Unicode.nbsp}world`);
    TinySelections.setSelection(editor, [ 0, 0 ], 5, [ 0, 0 ], 6);
    TinyUiActions.clickOnToolbar(editor, selectors.forecolorSplitButton);
    await TinyUiActions.pWaitForUi(editor, '.tox-swatches');
    TinyUiActions.clickOnUi(editor, 'div[data-mce-color="#3598DB"]');
    TinyAssertions.assertContentStructure(editor, forecolorStruct);
  });

  it('TBA: Backcolor on non breaking space', async () => {
    const editor = hook.editor();
    editor.setContent(`Hello${Unicode.nbsp}world`);
    TinySelections.setSelection(editor, [ 0, 0 ], 5, [ 0, 0 ], 6);
    TinyUiActions.clickOnToolbar(editor, selectors.backcolorSplitButton);
    await TinyUiActions.pWaitForUi(editor, '.tox-swatches');
    TinyUiActions.clickOnUi(editor, 'div[data-mce-color="#3598DB"]');
    TinyAssertions.assertContentStructure(editor, backcolorStruct);
  });

  it('TBA: Forecolor for a special char', async () => {
    const editor = hook.editor();
    editor.setContent('圓');
    TinySelections.setSelection(editor, [ 0, 0 ], 0, [ 0, 0 ], 1);
    TinyUiActions.clickOnToolbar(editor, selectors.forecolorSplitButton);
    await TinyUiActions.pWaitForUi(editor, '.tox-swatches');
    TinyUiActions.clickOnUi(editor, 'div[title="Red"]');
    TinyAssertions.assertContentStructure(editor, forecolorTitleStruct);
  });

  it('TBA: Backcolor for a special char that is 4-Byte UTF-8', async () => {
    const editor = hook.editor();
    editor.setContent('<p>&#142037;</p>');
    TinySelections.setSelection(editor, [ 0, 0 ], 0, [ 0, 0 ], 2);
    TinyUiActions.clickOnToolbar(editor, '[aria-label^="Background color"] > .tox-tbtn + .tox-split-button__chevron');
    await TinyUiActions.pWaitForUi(editor, '.tox-swatches');
    TinyUiActions.clickOnUi(editor, 'div[title="Red"]');
    TinyAssertions.assertContentStructure(editor, backcolorTitleStruct);
  });

  it('TINY-4838: Remove forecolor with collapsed selection', async () => {
    const editor = hook.editor();
    editor.setContent(`Hello${Unicode.nbsp}world`);
    TinySelections.setSelection(editor, [ 0, 0 ], 2, [ 0, 0 ], 2);
    TinyUiActions.clickOnToolbar(editor, '[aria-label^="Text color"] > .tox-tbtn + .tox-split-button__chevron');
    await TinyUiActions.pWaitForUi(editor, '.tox-swatches');
    TinyUiActions.clickOnUi(editor, 'div[data-mce-color="#3598DB"]');
    TinyAssertions.assertContentStructure(editor, forecolorTextStruct);
    TinyUiActions.clickOnToolbar(editor, '[aria-label^="Text color"] > .tox-tbtn + .tox-split-button__chevron');
    await TinyUiActions.pWaitForUi(editor, '.tox-swatches');
    TinyUiActions.clickOnUi(editor, 'div[title="Remove color"]');
    TinyAssertions.assertContent(editor, '<p>Hello&nbsp;world</p>');
  });
});
