import { RealKeys } from '@ephox/agar';
import { describe, it } from '@ephox/bedrock-client';
import { TinyAssertions, TinyHooks, TinySelections } from '@ephox/wrap-mcagar';

import Editor from 'tinymce/core/api/Editor';

import AccordionPlugin from '../../../main/ts/Plugin';
import * as AccordionUtils from '../module/AccordionUtils';

describe('webdriver.tinymce.plugins.accordion.AccordionEnterTest', () => {
  const hook = TinyHooks.bddSetup<Editor>(
    {
      plugins: 'accordion',
      indent: false,
      entities: 'raw',
      extended_valid_elements: 'details[class|open|data-mce-open],summary[class],div[class],p',
      base_url: '/project/tinymce/js/tinymce',
    },
    [ AccordionPlugin ],
    true
  );

  const pDoEnter = async (): Promise<void> => {
    await RealKeys.pSendKeysOn('iframe => body', [ RealKeys.text('Enter') ]);
  };

  it('TINY-9731: Toggle summary with ENTER keypress', async () => {
    const editor = hook.editor();
    editor.setContent(AccordionUtils.createAccordion({ summary: 'tiny' }));
    TinySelections.setCursor(editor, [ 0, 0, 0 ], 'tiny'.length);
    await pDoEnter();
    TinyAssertions.assertContentPresence(editor, { 'details:not([open="open"])': 1 });
    await pDoEnter();
    TinyAssertions.assertContentPresence(editor, { 'details[open="open"]': 1 });
  });

  it('TINY-10177: Toggle accordion with ENTER keypress when selection is before the summary', async () => {
    const editor = hook.editor();
    editor.setContent(AccordionUtils.createAccordion({ summary: 'tiny' }));
    TinySelections.setCursor(editor, [ 0 ], 0);
    await pDoEnter();
    TinyAssertions.assertContentPresence(editor, { 'details:not([open="open"])': 1 });
    await pDoEnter();
    TinyAssertions.assertContentPresence(editor, { 'details[open="open"]': 1 });
  });

  it('TINY-9731: Leave accordion body with ENTER keypress within an empty paragraph', async () => {
    const editor = hook.editor();
    editor.setContent(AccordionUtils.createAccordion({ body: '<p>tiny</p>' }));
    TinySelections.setCursor(editor, [ 0, 1, 0, 0 ], 'tiny'.length);
    await pDoEnter();
    TinyAssertions.assertContentPresence(editor, { 'details > div > p': 2 });
    await pDoEnter();
    TinyAssertions.assertContentPresence(editor, { 'details > div > p': 1 });
    TinyAssertions.assertContentPresence(editor, { 'details + p': 1 });
    TinyAssertions.assertCursor(editor, [ 1 ], 0);
  });

  it('TINY-9731: Do not remove the only empty paragraph when leaving accordion body with ENTER keypress', async () => {
    const editor = hook.editor();
    editor.setContent(AccordionUtils.createAccordion({ body: '<p></p>' }));
    TinySelections.setCursor(editor, [ 0, 1, 0 ], 0);
    await pDoEnter();
    TinyAssertions.assertContentPresence(editor, { 'details > div > p': 1 });
    TinyAssertions.assertContentPresence(editor, { 'details + p': 1 });
    TinyAssertions.assertCursor(editor, [ 1 ], 0);
  });

  it('TINY-9731: Leave accordion body with ENTER keypress within an empty paragraph for deprecated details', async () => {
    const editor = hook.editor();
    editor.setContent(`<details open="open"><summary>summary</summary><p>tiny</p></details>`);
    TinySelections.setCursor(editor, [ 0, 1, 0 ], 'tiny'.length);
    await pDoEnter();
    TinyAssertions.assertContentPresence(editor, { 'details > p': 2 });
    await pDoEnter();
    TinyAssertions.assertContentPresence(editor, { 'details > p': 1 });
    TinyAssertions.assertContentPresence(editor, { 'details + p': 1 });
    TinyAssertions.assertCursor(editor, [ 1 ], 0);
  });
});
