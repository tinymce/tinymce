import { ApproxStructure } from '@ephox/agar';
import { context, describe, it } from '@ephox/bedrock-client';
import { TinyAssertions, TinyHooks, TinyUiActions } from '@ephox/mcagar';

import Editor from 'tinymce/core/api/Editor';
import Plugin from 'tinymce/plugins/accordion/Plugin';

describe('browser.tinymce.plugins.accordion.FilterContentTest', () => {
  const hook = TinyHooks.bddSetupLight<Editor>({
    plugins: 'accordion',
    toolbar: 'accordion',
    base_url: '/project/tinymce/js/tinymce'
  }, [ Plugin ], true);

  const accordionStructure = () => {
    return ApproxStructure.build((s, str, _arr) => {
      return s.element('body', {
        children: [
          s.element('details', {
            exactClasses: [ 'mce-accordion' ],
            children: [
              s.element('summary', {
                exactClasses: [ 'mce-accordion-summary' ],
                children: [
                  s.text(str.is('Accordion summary...'))
                ]
              }),
              s.element('div', {
                exactClasses: [ 'mce-accordion-body' ],
                children: [
                  s.element('p', {
                    children: [
                      s.text(str.is('Accordion body...'))
                    ]
                  })
                ]
              })
            ]
          })
        ]
      });
    });
  };

  context('parsing', () => {
    it('TINY-9959: should have correct structure when inserting with toolbar button', () => {
      const editor = hook.editor();
      TinyUiActions.clickOnToolbar(editor, 'button[aria-label="Insert accordion"]');
      TinyAssertions.assertContentStructure(editor, accordionStructure());
    });

    it('TINY-9959: should have correct structure when inserting with command', () => {
      const editor = hook.editor();
      editor.execCommand('InsertAccordion');
      TinyAssertions.assertContentStructure(editor, accordionStructure());
    });

    // TODO:
    // TODO: Insert accordion into editor with setContent with custom body (single paragraph) and summary
    // TODO: Insert accordion into editor with setContent with custom body (multiple paragraphs) and summary
    // TODO: Insert accordion into editor with setContent where summary isn't the first child of the details element
    // TODO: Insert accordion into editor with setContent where there are multiple summaries
    // TODO: Insert accordion into editor with setContent where there is only a summary element
    // TODO: Insert accordion into editor with setContent where there is no summary element
  });

  // TODO:
  // context('serialization', () => {

  // });
});
