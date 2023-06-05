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
  const pDoBackspace = () => pDoBackspaceDelete('Backspace');
  const pDoDelete = () => pDoBackspaceDelete('Delete');

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

  context('Backspace/delete in element immediately after accordion', () => {
    const createAccordionWithParagraphAfter = (editor: Editor, content: string) =>
      editor.setContent(`${AccordionUtils.createAccordion({ summary: 'summary', body: '<p>body</p>' })}<p>${content}</p>`);
    const createAccordionWithSingleCharacterParagraphAfter = (editor: Editor) => createAccordionWithParagraphAfter(editor, 'a');
    const createAccordionWithThreeCharacterParagraphAfter = (editor: Editor) => createAccordionWithParagraphAfter(editor, 'abc');
    const createAccordionWithEmptyParagraphAfter = (editor: Editor) => createAccordionWithParagraphAfter(editor, '');

    const assertAccordionWithParagraphAfter = (editor: Editor, content: string) =>
      TinyAssertions.assertContent(editor, `${AccordionUtils.createAccordion({ summary: 'summary', body: '<p>body</p>' })}<p>${content}</p>`);
    const assertAccordionWithSingleCharacterParagraphAfter = (editor: Editor) => assertAccordionWithParagraphAfter(editor, 'a');
    const assertAccordionWithEmptyParagraphAfter = (editor: Editor) => assertAccordionWithParagraphAfter(editor, '');

    const assertAccordionWithParagraphAfterStructure = (editor: Editor) =>
      TinyAssertions.assertContentPresence(editor, { 'details > summary': 1, 'details > p': 1, 'p': 2 });

    it('TINY-9945: Can delete content in non-empty element immediately after accordion using BACKSPACE if caret is at end', async () => {
      const editor = hook.editor();
      createAccordionWithSingleCharacterParagraphAfter(editor);
      TinySelections.setCursor(editor, [ 1, 0 ], 'a'.length);
      await pDoBackspace();
      assertAccordionWithParagraphAfterStructure(editor);
      assertAccordionWithEmptyParagraphAfter(editor);
      TinyAssertions.assertCursor(editor, [ 1 ], 0);
    });

    it('TINY-9945: Can delete content in non-empty element immediately after accordion using BACKSPACE if caret is in middle', async () => {
      const editor = hook.editor();
      createAccordionWithThreeCharacterParagraphAfter(editor);
      TinySelections.setCursor(editor, [ 1, 0 ], 'a'.length);
      await pDoBackspace();
      assertAccordionWithParagraphAfterStructure(editor);
      assertAccordionWithParagraphAfter(editor, 'bc');
      TinyAssertions.assertCursor(editor, [ 1, 0 ], 0);
    });

    it('TINY-9945: Can delete content in non-empty element immediately after accordion using DELETE if caret is at start', async () => {
      const editor = hook.editor();
      createAccordionWithSingleCharacterParagraphAfter(editor);
      TinySelections.setCursor(editor, [ 1, 0 ], 0);
      await pDoDelete();
      assertAccordionWithParagraphAfterStructure(editor);
      assertAccordionWithEmptyParagraphAfter(editor);
      TinyAssertions.assertCursor(editor, [ 1 ], 0);
    });

    it('TINY-9945: Can delete content in non-empty element immediately after accordion using DELETE if caret is in middle', async () => {
      const editor = hook.editor();
      createAccordionWithThreeCharacterParagraphAfter(editor);
      TinySelections.setCursor(editor, [ 1, 0 ], 1);
      await pDoDelete();
      assertAccordionWithParagraphAfterStructure(editor);
      assertAccordionWithParagraphAfter(editor, 'ac');
      TinyAssertions.assertCursor(editor, [ 1, 0 ], 1);
    });

    it('TINY-9945: Should do nothing on DELETE if cursor is at end of non-empty immediately after accordion', async () => {
      const editor = hook.editor();
      createAccordionWithSingleCharacterParagraphAfter(editor);
      TinySelections.setCursor(editor, [ 1, 0 ], 'a'.length);
      await pDoDelete();
      assertAccordionWithParagraphAfterStructure(editor);
      assertAccordionWithSingleCharacterParagraphAfter(editor);
      TinyAssertions.assertCursor(editor, [ 1, 0 ], 'a'.length);
    });

    it('TINY-9945: Caret should move to end of details in accordion after pressing BACKSPACE in empty element immediately after accordion', async () => {
      const editor = hook.editor();
      createAccordionWithEmptyParagraphAfter(editor);
      TinySelections.setCursor(editor, [ 1, 0 ], 0);
      await pDoBackspace();
      assertAccordionWithParagraphAfterStructure(editor);
      assertAccordionWithEmptyParagraphAfter(editor);
      TinyAssertions.assertCursor(editor, [ 0, 1, 0 ], 'body'.length);
    });

    it('TINY-9945: Caret should move to end of details in accordion after pressing BACKSPACE in non-empty element immediately after accordion if caret is at start', async () => {
      const editor = hook.editor();
      createAccordionWithSingleCharacterParagraphAfter(editor);
      TinySelections.setCursor(editor, [ 1, 0 ], 0);
      await pDoBackspace();
      assertAccordionWithParagraphAfterStructure(editor);
      assertAccordionWithSingleCharacterParagraphAfter(editor);
      TinyAssertions.assertCursor(editor, [ 0, 1, 0 ], 'body'.length);
    });

    it('TINY-9945: Caret should move to end of details in accordion after pressing DELETE in empty element immediately after accordion', async () => {
      const editor = hook.editor();
      createAccordionWithEmptyParagraphAfter(editor);
      TinySelections.setCursor(editor, [ 1, 0 ], 0);
      await pDoDelete();
      assertAccordionWithParagraphAfterStructure(editor);
      assertAccordionWithEmptyParagraphAfter(editor);
      TinyAssertions.assertCursor(editor, [ 0, 1, 0 ], 'body'.length);
    });
  });
});
