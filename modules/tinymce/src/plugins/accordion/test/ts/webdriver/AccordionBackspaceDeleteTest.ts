import { RealKeys } from '@ephox/agar';
import { context, describe, it } from '@ephox/bedrock-client';
import { TinyAssertions, TinyHooks, TinySelections } from '@ephox/wrap-mcagar';

import Editor from 'tinymce/core/api/Editor';

import AccordionPlugin from '../../../main/ts/Plugin';
import * as AccordionUtils from '../module/AccordionUtils';

type DeletionKey = 'Backspace' | 'Delete';
type ContentLocation = 'summary' | 'body';

describe('webdriver.tinymce.plugins.accordion.AccordionBackspaceDeleteTest', () => {
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

  const pDoBackspaceDelete = async (key: DeletionKey): Promise<void> => {
    await RealKeys.pSendKeysOn('iframe => body', [ RealKeys.text(key) ]);
  };

  context('Deleting content in summary or body', () => {
    const createAccordionAndSelectAll = (editor: Editor, location: ContentLocation) => {
      editor.setContent(AccordionUtils.createAccordion({ summary: 'summary', body: '<p>body</p>' }));
      if (location === 'summary') {
        TinySelections.setSelection(editor, [ 0, 0, 0 ], 0, [ 0, 0, 0 ], 'summary'.length);
      } else {
        TinySelections.setSelection(editor, [ 0, 1, 0 ], 0, [ 0, 1, 0 ], 'body'.length);
      }
    };

    const testDeleteAllContentInAccordion = async (editor: Editor, contentLocation: ContentLocation, deletionKey: DeletionKey) => {
      createAccordionAndSelectAll(editor, contentLocation);
      await pDoBackspaceDelete(deletionKey);
      TinyAssertions.assertContentPresence(editor, { 'details > summary': 1, 'details > p': 1 });
      TinyAssertions.assertContent(editor, AccordionUtils.createAccordion(contentLocation === 'summary' ? { summary: '', body: '<p>body</p>' } : { summary: 'summary', body: '<p></p>' }));
    };

    it('TINY-9945: Can select all content in summary and delete it using Backspace', () => testDeleteAllContentInAccordion(hook.editor(), 'summary', 'Backspace'));
    it('TINY-9945: Can select all content in summary and delete it using Delete', () => testDeleteAllContentInAccordion(hook.editor(), 'summary', 'Delete'));
    it('TINY-9945: Can select all content in body and delete it using Backspace', () => testDeleteAllContentInAccordion(hook.editor(), 'body', 'Backspace'));
    it('TINY-9945: Can select all content in body and delete it using Delete', () => testDeleteAllContentInAccordion(hook.editor(), 'body', 'Delete'));
  });
});
