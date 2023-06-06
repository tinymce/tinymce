import { RealKeys } from '@ephox/agar';
import { context, describe, it } from '@ephox/bedrock-client';
import { PlatformDetection } from '@ephox/sand';
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

  const getAccordion = (): string =>
    `${AccordionUtils.createAccordion({ summary: 'summary', body: '<p>body</p>' })}`;
  const assertAccordion = (editor: Editor) =>
    TinyAssertions.assertContent(editor, getAccordion());
  const assertAccordionStructure = (editor: Editor) =>
    TinyAssertions.assertContentPresence(editor, { 'details > summary': 1, 'details > p': 1 });

  context('Backspace should not remove accordion elements', () => {
    it('TINY-9731: Prevent BACKSPACE from removing accordion body if a cursor is after the accordion', async () => {
      const editor = hook.editor();
      editor.setContent(AccordionUtils.createAccordion({ body: '<p><br/></p>' }) + '<p><br/></p>');
      TinySelections.setCursor(editor, [ 1, 0 ], 0);
      await pDoBackspace();
      TinyAssertions.assertContentPresence(editor, { 'details > p': 1 });
      TinyAssertions.assertCursor(editor, [ 0, 1 ], 0);
    });

    it('TINY-9884: Prevent BACKSPACE from removing accordion body if a cursor is in the accordion body', async () => {
      const editor = hook.editor();
      editor.setContent(AccordionUtils.createAccordion({ body: '<p><br/></p>' }));
      TinySelections.setCursor(editor, [ 0, 1 ], 0);
      await pDoBackspace();
      TinyAssertions.assertContentPresence(editor, { 'details > p': 1 });
      TinyAssertions.assertCursor(editor, [ 0, 1 ], 0);
    });

    it('TINY-9884: Prevent BACKSPACE from removing summary', async function () {
      if (PlatformDetection.detect().browser.isFirefox()) {
        // TODO - TINY-9949: Firefox performs an incorrect selection which causes the summary to be
        // removed unexpectedly, even though it should not be possible.
        this.skip();
      }
      const editor = hook.editor();
      editor.setContent(AccordionUtils.createAccordion({ summary: '' }));
      TinySelections.setCursor(editor, [ 0, 0 ], 0);
      await pDoBackspace();
      TinyAssertions.assertContentPresence(editor, { 'details > summary': 1 });
      TinyAssertions.assertCursor(editor, [ 0, 0 ], 0);
    });

    it('TINY-9884: Prevent BACKSPACE from removing summary when summary and details content are selected', async () => {
      const editor = hook.editor();
      editor.setContent(AccordionUtils.createAccordion({ summary: 'summary', body: '<p>body</p>' }));
      TinySelections.setSelection(editor, [ 0, 0, 0 ], 'sum'.length, [ 0, 1, 0 ], 'bo'.length);
      await pDoBackspace();
      TinyAssertions.assertContentPresence(editor, { 'details > summary': 1, 'details > p': 1 });
    });
  });

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
    const getAccordionWithParagraphAfter = (content: string): string =>
      `${getAccordion()}<p>${content}</p>`;

    const createAccordionWithParagraphAfter = (editor: Editor, content: string) =>
      editor.setContent(getAccordionWithParagraphAfter(content));
    const createAccordionWithSingleCharacterParagraphAfter = (editor: Editor) => createAccordionWithParagraphAfter(editor, 'a');
    const createAccordionWithThreeCharacterParagraphAfter = (editor: Editor) => createAccordionWithParagraphAfter(editor, 'abc');
    const createAccordionWithEmptyParagraphAfter = (editor: Editor) => createAccordionWithParagraphAfter(editor, '');

    const assertAccordionWithParagraphAfter = (editor: Editor, content: string) =>
      TinyAssertions.assertContent(editor, getAccordionWithParagraphAfter(content));
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

    it('TINY-9950: Selected text should be removed as expected after pressing BACKSPACE in non-empty element immediately after accordion if making a selection from start', async () => {
      const editor = hook.editor();
      createAccordionWithThreeCharacterParagraphAfter(editor);
      TinySelections.setSelection(editor, [ 1, 0 ], 0, [ 1, 0 ], 'abc'.length);
      await pDoBackspace();
      assertAccordionWithParagraphAfterStructure(editor);
      assertAccordionWithEmptyParagraphAfter(editor);
      TinyAssertions.assertCursor(editor, [ 1 ], 0);
    });

    it('TINY-9950: Selected text should be removed as expected after pressing DELETE in non-empty element immediately after accordion if making a selection from start', async () => {
      const editor = hook.editor();
      createAccordionWithThreeCharacterParagraphAfter(editor);
      TinySelections.setSelection(editor, [ 1, 0 ], 0, [ 1, 0 ], 'abc'.length);
      await pDoDelete();
      assertAccordionWithParagraphAfterStructure(editor);
      assertAccordionWithEmptyParagraphAfter(editor);
      TinyAssertions.assertCursor(editor, [ 1 ], 0);
    });

    it('TINY-9950: Should forward delete element after pressing DELETE in empty element immediately after accordion if the element is not the last element of the editor', async () => {
      const editor = hook.editor();
      editor.setContent(`${getAccordionWithParagraphAfter('')}<p>xyz</p>`);
      TinySelections.setCursor(editor, [ 1, 0 ], 0);
      await pDoDelete();
      assertAccordionWithParagraphAfterStructure(editor);
      assertAccordionWithParagraphAfter(editor, 'xyz');
      TinyAssertions.assertCursor(editor, [ 1, 0 ], 0);
    });

    it('TINY-9950: Should do nothing after pressing DELETE in empty element immediately after accordion if the element is the last element of the editor', async () => {
      const editor = hook.editor();
      createAccordionWithEmptyParagraphAfter(editor);
      TinySelections.setCursor(editor, [ 1, 0 ], 0);
      await pDoDelete();
      assertAccordionWithParagraphAfterStructure(editor);
      assertAccordionWithEmptyParagraphAfter(editor);
      TinyAssertions.assertCursor(editor, [ 1 ], 0);
    });
  });

  context('Backspace/delete in element immediately before accordion', () => {
    const getAccordionWithParagraphBefore = (content: string): string =>
      `<p>${content}</p>${getAccordion()}`;

    const createAccordionWithParagraphBefore = (editor: Editor, content: string) =>
      editor.setContent(getAccordionWithParagraphBefore(content));
    const createAccordionWithEmptyParagraphBefore = (editor: Editor) => createAccordionWithParagraphBefore(editor, '');
    const createAccordionWithSingleCharacterParagraphBefore = (editor: Editor) => createAccordionWithParagraphBefore(editor, 'a');

    const assertAccordionWithParagraphBefore = (editor: Editor, content: string) =>
      TinyAssertions.assertContent(editor, getAccordionWithParagraphBefore(content));
    const assertAccordionWithSingleCharacterParagraphBefore = (editor: Editor) => assertAccordionWithParagraphBefore(editor, 'a');

    const assertAccordionWithParagraphBeforeStructure = (editor: Editor) =>
      TinyAssertions.assertContentPresence(editor, { 'details > summary': 1, 'details > p': 1, 'p': 2 });

    it('TINY-9950: Nothing happens after pressing DELETE in non-empty element immediately before accordion if caret at the end of element', async () => {
      const editor = hook.editor();
      createAccordionWithSingleCharacterParagraphBefore(editor);
      TinySelections.setCursor(editor, [ 0, 0 ], 'a'.length);
      await pDoDelete();
      assertAccordionWithParagraphBeforeStructure(editor);
      assertAccordionWithSingleCharacterParagraphBefore(editor);
      TinyAssertions.assertCursor(editor, [ 0, 0 ], 'a'.length);
    });

    it('TINY-9950: Empty paragraph is deleted and caret moves to start of summary after pressing DELETE in empty element immediately before accordion', async () => {
      const editor = hook.editor();
      createAccordionWithEmptyParagraphBefore(editor);
      TinySelections.setCursor(editor, [ 0, 0 ], 0);
      await pDoDelete();
      assertAccordionStructure(editor);
      assertAccordion(editor);
      TinyAssertions.assertCursor(editor, [ 0, 0, 0 ], 0);
    });
  });
});
