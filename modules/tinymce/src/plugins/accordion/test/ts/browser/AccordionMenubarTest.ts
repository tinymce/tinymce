import { describe, it } from '@ephox/bedrock-client';
import { TinyAssertions, TinyHooks, TinyUiActions } from '@ephox/wrap-mcagar';

import Editor from 'tinymce/core/api/Editor';
import Plugin from 'tinymce/plugins/accordion/Plugin';

describe('browser.tinymce.plugins.accordion.AccordionMenubarTest', () => {
  const hook = TinyHooks.bddSetup<Editor>(
    {
      plugins: 'accordion',
      base_url: '/project/tinymce/js/tinymce',
      indent: false,
      menu: { insert: { title: 'Insert', items: 'accordion' }}
    },
    [ Plugin ],
    true
  );

  const insertMenuSelector = '.tox-mbtn:contains("Insert")';
  const insertAccordionSelector = '[aria-label="Accordion"]';

  it('TINY-9961: Insert accordion with menubar button', async () => {
    const editor = hook.editor();
    editor.setContent('<p>paragraph</p>');

    TinyUiActions.clickOnUi(editor, insertMenuSelector);
    await TinyUiActions.pWaitForUi(editor, insertAccordionSelector);
    TinyUiActions.clickOnUi(editor, insertAccordionSelector);
    TinyAssertions.assertContentPresence(editor, { 'details[open="open"]': 1, 'p': 2 });
  });
});
