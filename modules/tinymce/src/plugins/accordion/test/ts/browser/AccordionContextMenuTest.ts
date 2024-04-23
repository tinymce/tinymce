import { describe, it } from '@ephox/bedrock-client';
import { TinyAssertions, TinyHooks, TinyUiActions } from '@ephox/wrap-mcagar';

import Editor from 'tinymce/core/api/Editor';
import Plugin from 'tinymce/plugins/accordion/Plugin';

import * as AccordionUtils from '../module/AccordionUtils';

describe('browser.tinymce.plugins.accordion.AccordionContextMenuTest', () => {
  const hook = TinyHooks.bddSetup<Editor>(
    {
      plugins: 'accordion',
      base_url: '/project/tinymce/js/tinymce',
      indent: false
    },
    [ Plugin ],
    true
  );

  const contextMenuSelector = '.tox-silver-sink [role="toolbar"]';
  const toggleSelector = 'button[aria-label="Toggle accordion"]';
  const deleteSelector = 'button[aria-label="Delete accordion"]';

  it('TINY-9961: Toggle open, then closed, then delete', async () => {
    const editor = hook.editor();
    const startContent = AccordionUtils.createAccordion({ summary: 'heading', open: false });
    editor.setContent(startContent);

    await TinyUiActions.pTriggerContextMenu(editor, 'details', contextMenuSelector);

    TinyUiActions.clickOnUi(editor, toggleSelector);
    TinyAssertions.assertContentPresence(editor, { 'details[open="open"]': 1 });

    TinyUiActions.clickOnUi(editor, toggleSelector);
    TinyAssertions.assertContent(editor, startContent);

    TinyUiActions.clickOnUi(editor, deleteSelector);
    TinyAssertions.assertContent(editor, '');
  });

  it('TINY-9961: Toggle closed, then open, then delete', async () => {
    const editor = hook.editor();
    const startContent = AccordionUtils.createAccordion({ summary: 'heading', open: true });
    editor.setContent(startContent);

    await TinyUiActions.pTriggerContextMenu(editor, 'details', contextMenuSelector);

    TinyUiActions.clickOnUi(editor, toggleSelector);
    TinyAssertions.assertContentPresence(editor, { 'details[open="open"]': 0 });

    TinyUiActions.clickOnUi(editor, toggleSelector);
    TinyAssertions.assertContent(editor, startContent);

    TinyUiActions.clickOnUi(editor, deleteSelector);
    TinyAssertions.assertContent(editor, '');
  });
});
