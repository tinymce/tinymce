import { RealKeys } from '@ephox/agar';
import { context, describe, it } from '@ephox/bedrock-client';
import { Type } from '@ephox/katamari';
import { PlatformDetection } from '@ephox/sand';
import { TinyAssertions, TinyHooks, TinySelections } from '@ephox/wrap-mcagar';

import Editor from 'tinymce/core/api/Editor';

import AccordionPlugin from '../../../main/ts/Plugin';
import * as AccordionUtils from '../module/AccordionUtils';

type DeletionKey = 'Backspace' | 'Delete';
type ContentLocation = 'summary' | 'body';

interface AccordionSpec {
  summary?: string;
  body?: string;
}

interface BackspaceDeleteModifier {
  ctrlKey?: boolean;
  altKey?: boolean;
}

describe('webdriver.tinymce.plugins.accordion.AccordionBackspaceDeleteTest', () => {
  const settings = {
    plugins: 'accordion',
    base_url: '/project/tinymce/js/tinymce',
    indent: false
  };
  const hook = TinyHooks.bddSetup<Editor>(settings, [ AccordionPlugin ], true);

  const platform = PlatformDetection.detect();
  const os = platform.os;
  const isSafari = platform.browser.isSafari();
  const isFirefox = platform.browser.isFirefox();
  const isMacOS = os.isMacOS();
  const isWindows = os.isWindows();

  const pDoBackspaceDelete = async (key: DeletionKey, modifier?: BackspaceDeleteModifier): Promise<void> => {
    await RealKeys.pSendKeysOn('iframe => body', [ Type.isUndefined(modifier) ? RealKeys.text(key) : RealKeys.combo(modifier, key) ]);
  };
  const pDoBackspace = (modifier?: BackspaceDeleteModifier) => pDoBackspaceDelete('Backspace', modifier);
  const pDoDelete = (modifier?: BackspaceDeleteModifier) => pDoBackspaceDelete('Delete', modifier);

  const getAccordionContent = ({ summary, body }: AccordionSpec = { summary: 'summary', body: '<p>body</p>' }): string =>
    `${AccordionUtils.createAccordion({ summary, body })}`;
  const assertAccordionContent = (editor: Editor, spec?: AccordionSpec) =>
    TinyAssertions.assertContent(editor, getAccordionContent(spec));
  const createAccordion = (editor: Editor, spec?: AccordionSpec) =>
    editor.setContent(getAccordionContent(spec));

  context('Undo/redo backspace/delete', () => {
    const testUndoRedo = (deletionKey: DeletionKey, location: ContentLocation) => async () => {
      const isBackspace = deletionKey === 'Backspace';
      const isSummary = location === 'summary';
      const editor = hook.editor();
      createAccordion(editor);
      const path = isSummary ? [ 0, 0, 0 ] : [ 0, 1, 0, 0 ];
      const initialOffset = isSummary ? 'sum'.length : 'bo'.length;
      TinySelections.setCursor(editor, path, initialOffset);
      await pDoBackspaceDelete(deletionKey);

      let expectedContent: string;
      if (isBackspace) {
        expectedContent = isSummary ? 'sumary' : '<p>bdy</p>';
      } else {
        expectedContent = isSummary ? 'sumary' : '<p>boy</p>';
      }
      const expectedAccordionSpec = isSummary ? { summary: expectedContent, body: '<p>body</p>' } : { summary: 'summary', body: expectedContent };
      assertAccordionContent(editor, expectedAccordionSpec);

      let expectedOffset: number;
      if (isBackspace) {
        expectedOffset = isSummary ? 'su'.length : 'b'.length;
      } else {
        expectedOffset = isSummary ? 'sum'.length : 'bo'.length;
      }
      TinyAssertions.assertCursor(editor, path, expectedOffset);

      editor.undoManager.undo();
      assertAccordionContent(editor);
      TinyAssertions.assertCursor(editor, path, initialOffset);

      editor.undoManager.redo();
      assertAccordionContent(editor, expectedAccordionSpec);
      TinyAssertions.assertCursor(editor, path, expectedOffset);
    };

    it('TINY-9951: Can undo/redo BACKSPACE in summary', testUndoRedo('Backspace', 'summary'));
    it('TINY-9951: Can undo/redo DELETE in summary', testUndoRedo('Delete', 'summary'));
    it('TINY-9951: Can undo/redo BACKSPACE in body', testUndoRedo('Backspace', 'body'));
    it('TINY-9951: Can undo/redo DELETE in body', testUndoRedo('Delete', 'body'));
  });

  context('Backspace should not remove accordion elements', () => {
    it('TINY-9731: Prevent BACKSPACE from removing accordion body if a cursor is after the accordion', async () => {
      const editor = hook.editor();
      editor.setContent(AccordionUtils.createAccordion({ body: '<p><br></p>' }) + '<p><br></p>');
      TinySelections.setCursor(editor, [ 1, 0 ], 0);
      await pDoBackspace();
      TinyAssertions.assertContentPresence(editor, { 'details > div > p': 1 });
      TinyAssertions.assertCursor(editor, [ 0, 1, 0 ], 0);
    });

    const testPreventBodyDeletion = (deletionKey: DeletionKey) => async () => {
      const editor = hook.editor();
      editor.setContent(createAccordion(editor, { body: '<p><br></p>' }));
      TinySelections.setCursor(editor, [ 0, 1, 0 ], 0);
      await pDoBackspaceDelete(deletionKey);
      TinyAssertions.assertContentPresence(editor, { 'details > div > p': 1 });
      TinyAssertions.assertCursor(editor, [ 0, 1, 0 ], 0);
    };

    it('TINY-9884: Prevent BACKSPACE from removing accordion body if a cursor is in the accordion body', testPreventBodyDeletion('Backspace'));
    it('TINY-9951: Prevent DELETE from removing accordion body if a cursor is in the accordion body', testPreventBodyDeletion('Delete'));

    const testPreventSummaryDeletion = (deletionKey: DeletionKey) => async () => {
      const editor = hook.editor();
      createAccordion(editor, { summary: '&nbsp;' });
      TinySelections.setCursor(editor, [ 0, 0 ], 0);
      await pDoBackspaceDelete(deletionKey);
      TinyAssertions.assertContentPresence(editor, { 'details > summary': 1 });
      TinyAssertions.assertCursor(editor, [ 0, 0 ], 0);
    };

    it('TINY-9884: Prevent BACKSPACE from removing summary', testPreventSummaryDeletion('Backspace'));
    it('TINY-9951: Prevent DELETE from removing summary', testPreventSummaryDeletion('Delete'));

    const testPreventSummaryBodyDeletion = (deletionKey: DeletionKey) => async () => {
      const editor = hook.editor();
      createAccordion(editor);
      TinySelections.setSelection(editor, [ 0, 0, 0 ], 'sum'.length, [ 0, 1, 0, 0 ], 'bo'.length);
      await pDoBackspaceDelete(deletionKey);
      TinyAssertions.assertContentPresence(editor, { 'details > summary': 1, 'details > div > p': 1 });
    };

    it('TINY-9884: Prevent BACKSPACE from removing summary when summary and details content are selected', testPreventSummaryBodyDeletion('Backspace'));
    it('TINY-9951: Prevent DELETE from removing summary when summary and details content are selected', testPreventSummaryBodyDeletion('Delete'));
  });

  context('Deleting content in summary or body', () => {
    context('With a collapsed selection', () => {
      it('TINY-9951: Deleting content in summary by pressing BACKSPACE should work as expected if caret at the end of summary content', async () => {
        const editor = hook.editor();
        createAccordion(editor);
        TinySelections.setCursor(editor, [ 0, 0, 0 ], 'summary'.length);
        await pDoBackspace();
        assertAccordionContent(editor, { summary: 'summar', body: '<p>body</p>' });
        TinyAssertions.assertCursor(editor, [ 0, 0, 0 ], 'summar'.length);
      });

      it('TINY-9951: Deleting content in summary by pressing BACKSPACE should work as expected if caret at the end of summary content and content is a single character', async () => {
        const editor = hook.editor();
        createAccordion(editor, { summary: 's', body: '<p>body</p>' });
        TinySelections.setCursor(editor, [ 0, 0, 0 ], 's'.length);
        await pDoBackspace();
        assertAccordionContent(editor, { summary: '&nbsp;', body: '<p>body</p>' });
        TinyAssertions.assertCursor(editor, [ 0, 0 ], 0);
      });

      it('TINY-9951: Deleting content in summary by pressing BACKSPACE should work as expected if caret in middle of summary content', async () => {
        const editor = hook.editor();
        createAccordion(editor);
        TinySelections.setCursor(editor, [ 0, 0, 0 ], 'sum'.length);
        await pDoBackspace();
        assertAccordionContent(editor, { summary: 'sumary', body: '<p>body</p>' });
        TinyAssertions.assertCursor(editor, [ 0, 0, 0 ], 'su'.length);
      });

      it('TINY-9951: Nothing should happen after pressing BACKSPACE if caret at start of summary', async () => {
        const editor = hook.editor();
        createAccordion(editor);
        TinySelections.setCursor(editor, [ 0, 0, 0 ], 0);
        await pDoBackspace();
        assertAccordionContent(editor);
        TinyAssertions.assertCursor(editor, [ 0, 0, 0 ], 0);
      });

      it('TINY-9951: Deleting content in summary by pressing DELETE should work as expected if caret at beginning of summary content', async () => {
        const editor = hook.editor();
        createAccordion(editor);
        TinySelections.setCursor(editor, [ 0, 0, 0 ], 0);
        await pDoDelete();
        assertAccordionContent(editor, { summary: 'ummary', body: '<p>body</p>' });
        TinyAssertions.assertCursor(editor, [ 0, 0, 0 ], 0);
      });

      it('TINY-9951: Deleting content in summary by pressing DELETE should work as expected if caret at the beginning of summary content and content is a single character', async () => {
        const editor = hook.editor();
        createAccordion(editor, { summary: 's', body: '<p>body</p>' });
        TinySelections.setCursor(editor, [ 0, 0, 0 ], 0);
        await pDoDelete();
        assertAccordionContent(editor, { summary: '&nbsp;', body: '<p>body</p>' });
        TinyAssertions.assertCursor(editor, [ 0, 0 ], 0);
      });

      it('TINY-9951: Deleting content in summary by pressing DELETE should work as expected if caret in middle of summary content', async () => {
        const editor = hook.editor();
        createAccordion(editor);
        TinySelections.setCursor(editor, [ 0, 0, 0 ], 'sum'.length);
        await pDoDelete();
        assertAccordionContent(editor, { summary: 'sumary', body: '<p>body</p>' });
        TinyAssertions.assertCursor(editor, [ 0, 0, 0 ], 'sum'.length);
      });

      it('TINY-9951: Nothing should happen after pressing DELETE if caret at end of summary', async () => {
        const editor = hook.editor();
        createAccordion(editor);
        TinySelections.setCursor(editor, [ 0, 0, 0 ], 'summary'.length);
        await pDoDelete();
        assertAccordionContent(editor);
        TinyAssertions.assertCursor(editor, [ 0, 0, 0 ], 'summary'.length);
      });

      it('TINY-9951: Deleting content in body by pressing BACKSPACE should work as expected if caret at end of body content', async () => {
        const editor = hook.editor();
        createAccordion(editor);
        TinySelections.setCursor(editor, [ 0, 1, 0, 0 ], 'body'.length);
        await pDoBackspace();
        assertAccordionContent(editor, { summary: 'summary', body: '<p>bod</p>' });
        TinyAssertions.assertCursor(editor, [ 0, 1, 0, 0 ], 'bod'.length);
      });

      it('TINY-9951: Deleting content in body by pressing BACKSPACE should work as expected if caret in middle of body content', async () => {
        const editor = hook.editor();
        createAccordion(editor);
        TinySelections.setCursor(editor, [ 0, 1, 0, 0 ], 'bo'.length);
        await pDoBackspace();
        assertAccordionContent(editor, { summary: 'summary', body: '<p>bdy</p>' });
        TinyAssertions.assertCursor(editor, [ 0, 1, 0, 0 ], 'b'.length);
      });

      it('TINY-9951: Nothing should happen after pressing BACKSPACE if caret at start of body', async () => {
        const editor = hook.editor();
        createAccordion(editor);
        TinySelections.setCursor(editor, [ 0, 1, 0 ], 0);
        await pDoBackspace();
        assertAccordionContent(editor);
        TinyAssertions.assertCursor(editor, [ 0, 1, 0 ], 0);
      });

      it('TINY-9951: Deleting content in body by pressing DELETE should work as expected if caret at beginning of body content', async () => {
        const editor = hook.editor();
        createAccordion(editor);
        TinySelections.setCursor(editor, [ 0, 1, 0 ], 0);
        await pDoDelete();
        assertAccordionContent(editor, { summary: 'summary', body: '<p>ody</p>' });
        // TODO: Investigate why the path is different here on Firefox and Safari
        TinyAssertions.assertCursor(editor, isFirefox || isSafari ? [ 0, 1, 0 ] : [ 0, 1, 0, 0 ], 0);
      });

      it('TINY-9951: Deleting content in body by pressing DELETE should work as expected if caret in middle of body content', async () => {
        const editor = hook.editor();
        createAccordion(editor);
        TinySelections.setCursor(editor, [ 0, 1, 0, 0 ], 'bo'.length);
        await pDoDelete();
        assertAccordionContent(editor, { summary: 'summary', body: '<p>boy</p>' });
        TinyAssertions.assertCursor(editor, [ 0, 1, 0, 0 ], 'bo'.length);
      });

      it('TINY-9951: Nothing should happen after pressing DELETE if caret at end of body', async () => {
        const editor = hook.editor();
        createAccordion(editor);
        TinySelections.setCursor(editor, [ 0, 1, 0, 0 ], 'body'.length);
        await pDoDelete();
        assertAccordionContent(editor);
        TinyAssertions.assertCursor(editor, [ 0, 1, 0, 0 ], 'body'.length);
      });

      it('TINY-9965: Nothing should happen if you delete before nested details inside details', async () => {
        const editor = hook.editor();
        const initialContent = AccordionUtils.createAccordion({ summary: 's1', body: `<div>&nbsp;</div>${AccordionUtils.createAccordion({ summary: 's2', body: 'body' })}` });
        editor.setContent(initialContent);
        TinySelections.setCursor(editor, [ 0, 1, 0 ], 0);
        await pDoDelete();
        TinyAssertions.assertContent(editor, initialContent);
        TinyAssertions.assertCursor(editor, [ 0, 1, 0 ], 0);
      });

      it('TINY-9965: Backspace should only move the caret to the end of the details body if you backspace in last block after a nested details', async () => {
        const editor = hook.editor();
        const initialContent = AccordionUtils.createAccordion({ summary: 's1', body: AccordionUtils.createAccordion({ summary: 's2', body: 'body' }) + '<div>&nbsp;</div>' });
        editor.setContent(initialContent);
        TinySelections.setCursor(editor, [ 0, 1, 1 ], 0);
        await pDoBackspace();
        TinyAssertions.assertContent(editor, initialContent);
        TinyAssertions.assertCursor(editor, [ 0, 1, 0, 1, 0 ], 'body'.length);
      });
    });

    context('With a ranged selection', () => {
      const createAccordionAndSelectAll = (editor: Editor, location: ContentLocation) => {
        createAccordion(editor);
        if (location === 'summary') {
          TinySelections.setSelection(editor, [ 0, 0, 0 ], 0, [ 0, 0, 0 ], 'summary'.length);
        } else {
          TinySelections.setSelection(editor, [ 0, 1, 0, 0 ], 0, [ 0, 1, 0, 0 ], 'body'.length);
        }
      };

      const testDeleteAllContentInAccordion = (contentLocation: ContentLocation, deletionKey: DeletionKey) => async () => {
        const editor = hook.editor();
        createAccordionAndSelectAll(editor, contentLocation);
        await pDoBackspaceDelete(deletionKey);
        const isLocationSummary = contentLocation === 'summary';
        TinyAssertions.assertContent(editor, AccordionUtils.createAccordion(isLocationSummary ? { summary: '&nbsp;', body: '<p>body</p>' } : { summary: 'summary', body: '<p>&nbsp;</p>' }));
        TinyAssertions.assertCursor(editor, isLocationSummary ? [ 0, 0 ] : [ 0, 1, 0 ], 0);
      };

      it('TINY-9945: Can select all content in summary and delete it using Backspace', testDeleteAllContentInAccordion('summary', 'Backspace'));
      it('TINY-9945: Can select all content in summary and delete it using Delete', testDeleteAllContentInAccordion('summary', 'Delete'));
      it('TINY-9945: Can select all content in body and delete it using Backspace', testDeleteAllContentInAccordion('body', 'Backspace'));
      it('TINY-9945: Can select all content in body and delete it using Delete', testDeleteAllContentInAccordion('body', 'Delete'));

      const testDeleteSelectionFromStartInSummary = (deletionKey: DeletionKey) => async () => {
        const editor = hook.editor();
        createAccordion(editor);
        TinySelections.setSelection(editor, [ 0, 0, 0 ], 0, [ 0, 0, 0 ], 'sum'.length);
        await pDoBackspaceDelete(deletionKey);
        assertAccordionContent(editor, { summary: 'mary', body: '<p>body</p>' });
        TinyAssertions.assertCursor(editor, [ 0, 0, 0 ], 0);
      };

      it('TINY-9951: Can select content from start in summary and delete it using Backspace', testDeleteSelectionFromStartInSummary('Backspace'));
      it('TINY-9951: Can select content from start in summary and delete it using Delete', testDeleteSelectionFromStartInSummary('Delete'));

      const testDeleteSelectionInMiddleInSummary = (deletionKey: DeletionKey) => async () => {
        const editor = hook.editor();
        createAccordion(editor);
        TinySelections.setSelection(editor, [ 0, 0, 0 ], 'su'.length, [ 0, 0, 0 ], 'summ'.length);
        await pDoBackspaceDelete(deletionKey);
        assertAccordionContent(editor, { summary: 'suary', body: '<p>body</p>' });
        TinyAssertions.assertCursor(editor, [ 0, 0, 0 ], 'su'.length);
      };

      it('TINY-9951: Can select content in middle in summary and delete it using Backspace', testDeleteSelectionInMiddleInSummary('Backspace'));
      it('TINY-9951: Can select content in middle in summary and delete it using Delete', testDeleteSelectionInMiddleInSummary('Delete'));

      const testDeleteSelectionFromEndInSummary = (deletionKey: DeletionKey) => async () => {
        const editor = hook.editor();
        createAccordion(editor);
        TinySelections.setSelection(editor, [ 0, 0, 0 ], 'sum'.length, [ 0, 0, 0 ], 'summary'.length);
        await pDoBackspaceDelete(deletionKey);
        assertAccordionContent(editor, { summary: 'sum', body: '<p>body</p>' });
        TinyAssertions.assertCursor(editor, [ 0, 0, 0 ], 'sum'.length);
      };

      it('TINY-9951: Can select content from end in summary and delete it using Backspace', testDeleteSelectionFromEndInSummary('Backspace'));
      it('TINY-9951: Can select content from end in summary and delete it using Delete', testDeleteSelectionFromEndInSummary('Delete'));

      const testDeleteSelectionFromStartInBody = (deletionKey: DeletionKey) => async () => {
        const editor = hook.editor();
        createAccordion(editor);
        TinySelections.setSelection(editor, [ 0, 1, 0, 0 ], 0, [ 0, 1, 0, 0 ], 'bo'.length);
        await pDoBackspaceDelete(deletionKey);
        assertAccordionContent(editor, { summary: 'summary', body: '<p>dy</p>' });
        TinyAssertions.assertCursor(editor, [ 0, 1, 0, 0 ], 0);
      };

      it('TINY-9951: Can select content from start in body and delete it using Backspace', testDeleteSelectionFromStartInBody('Backspace'));
      it('TINY-9951: Can select content from start in body and delete it using Delete', testDeleteSelectionFromStartInBody('Delete'));

      const testDeleteSelectionInMiddleInBody = (deletionKey: DeletionKey) => async () => {
        const editor = hook.editor();
        createAccordion(editor);
        TinySelections.setSelection(editor, [ 0, 1, 0, 0 ], 'b'.length, [ 0, 1, 0, 0 ], 'bod'.length);
        await pDoBackspaceDelete(deletionKey);
        assertAccordionContent(editor, { summary: 'summary', body: '<p>by</p>' });
        TinyAssertions.assertCursor(editor, [ 0, 1, 0, 0 ], 'b'.length);
      };

      it('TINY-9951: Can select content in middle in body and delete it using Backspace', testDeleteSelectionInMiddleInBody('Backspace'));
      it('TINY-9951: Can select content in middle in body and delete it using Delete', testDeleteSelectionInMiddleInBody('Delete'));

      const testDeleteSelectionFromEndInBody = (deletionKey: DeletionKey) => async () => {
        const editor = hook.editor();
        createAccordion(editor);
        TinySelections.setSelection(editor, [ 0, 1, 0, 0 ], 'bo'.length, [ 0, 1, 0, 0 ], 'body'.length);
        await pDoBackspaceDelete(deletionKey);
        assertAccordionContent(editor, { summary: 'summary', body: '<p>bo</p>' });
        TinyAssertions.assertCursor(editor, [ 0, 1, 0, 0 ], 'bo'.length);
      };

      it('TINY-9951: Can select content from end in body and delete it using Backspace', testDeleteSelectionFromEndInBody('Backspace'));
      it('TINY-9951: Can select content from end in body and delete it using Delete', testDeleteSelectionFromEndInBody('Delete'));
    });

    context('Using ranged deletion keyboard shortcuts', () => {
      const pDoCtrlBackspaceDelete = (deletionKey: DeletionKey) => pDoBackspaceDelete(deletionKey, isMacOS ? { altKey: true } : { ctrlKey: true });

      const testCtrlDeletion = (deletionKey: DeletionKey, location: ContentLocation) => async () => {
        const editor = hook.editor();
        const isBackspace = deletionKey === 'Backspace';
        const isSummary = location === 'summary';
        const initialContent = 'word1 word2';
        const getSummarySpec = (content: string): AccordionSpec => isSummary ? { summary: content, body: '<p>body</p>' } : { summary: 'summary', body: `<p>${content}</p>` };
        createAccordion(editor, getSummarySpec(initialContent));
        TinySelections.setCursor(editor, isSummary ? [ 0, 0, 0 ] : [ 0, 1, 0, 0 ], isBackspace ? 'word1 wo'.length : 'wo'.length);
        await pDoCtrlBackspaceDelete(deletionKey);

        let expectedContent: string;
        if (isBackspace) {
          expectedContent = 'word1 rd2';
        } else if (isWindows) {
          // Difference in native behavior for Ctrl + Delete on Windows
          expectedContent = 'woword2';
        } else {
          expectedContent = 'wo word2';
        }
        assertAccordionContent(editor, getSummarySpec(expectedContent));

        // TINY-9302: Extra format caret added when using keyboard shortcut ranged deletion, except on Safari
        // due to TINY-9951 workaround
        let expectedPath: number[];
        let expectedOffset: number;
        if (isSafari) {
          expectedPath = isSummary ? [ 0, 0, 0 ] : [ 0, 1, 0, 0 ];
          expectedOffset = isBackspace ? 'word1 '.length : 'wo'.length;
        } else {
          expectedPath = isSummary ? [ 0, 0, 1, 0 ] : [ 0, 1, 0, 1, 0 ];
          // 0 offset as selection positioned within format caret
          expectedOffset = 0;
        }
        TinyAssertions.assertCursor(editor, expectedPath, expectedOffset);
      };

      const testCtrlDeletionInSummary = (deletionKey: DeletionKey) => testCtrlDeletion(deletionKey, 'summary');
      it('TINY-9951: Can delete summary using Ctrl+Backspace', testCtrlDeletionInSummary('Backspace'));
      it('TINY-9951: Can delete summary using Ctrl+Delete', testCtrlDeletionInSummary('Delete'));

      const testCtrlDeletionInBody = (deletionKey: DeletionKey) => testCtrlDeletion(deletionKey, 'body');
      it('TINY-9951: Can delete body using Ctrl+Backspace', testCtrlDeletionInBody('Backspace'));
      it('TINY-9951: Can delete body using Ctrl+Delete', testCtrlDeletionInBody('Delete'));
    });
  });

  context('Backspace/delete in element immediately after accordion', () => {
    const getAccordionWithParagraphAfter = (content: string): string =>
      `${getAccordionContent()}<p>${content}</p>`;

    const createAccordionWithParagraphAfter = (editor: Editor, content: string) =>
      editor.setContent(getAccordionWithParagraphAfter(content));
    const createAccordionWithSingleCharacterParagraphAfter = (editor: Editor) => createAccordionWithParagraphAfter(editor, 'a');
    const createAccordionWithThreeCharacterParagraphAfter = (editor: Editor) => createAccordionWithParagraphAfter(editor, 'abc');
    const createAccordionWithEmptyParagraphAfter = (editor: Editor) => createAccordionWithParagraphAfter(editor, '&nbsp;');

    const assertAccordionWithParagraphAfter = (editor: Editor, content: string) =>
      TinyAssertions.assertContent(editor, getAccordionWithParagraphAfter(content));
    const assertAccordionWithSingleCharacterParagraphAfter = (editor: Editor) => assertAccordionWithParagraphAfter(editor, 'a');
    const assertAccordionWithEmptyParagraphAfter = (editor: Editor) => assertAccordionWithParagraphAfter(editor, '&nbsp;');

    it('TINY-9945: Can delete content in non-empty element immediately after accordion using BACKSPACE if caret is at end', async () => {
      const editor = hook.editor();
      createAccordionWithSingleCharacterParagraphAfter(editor);
      TinySelections.setCursor(editor, [ 1, 0 ], 'a'.length);
      await pDoBackspace();
      assertAccordionWithEmptyParagraphAfter(editor);
      TinyAssertions.assertCursor(editor, [ 1 ], 0);
    });

    it('TINY-9945: Can delete content in non-empty element immediately after accordion using BACKSPACE if caret is in middle', async () => {
      const editor = hook.editor();
      createAccordionWithThreeCharacterParagraphAfter(editor);
      TinySelections.setCursor(editor, [ 1, 0 ], 'a'.length);
      await pDoBackspace();
      assertAccordionWithParagraphAfter(editor, 'bc');
      TinyAssertions.assertCursor(editor, [ 1, 0 ], 0);
    });

    it('TINY-9945: Can delete content in non-empty element immediately after accordion using DELETE if caret is at start', async () => {
      const editor = hook.editor();
      createAccordionWithSingleCharacterParagraphAfter(editor);
      TinySelections.setCursor(editor, [ 1, 0 ], 0);
      await pDoDelete();
      assertAccordionWithEmptyParagraphAfter(editor);
      TinyAssertions.assertCursor(editor, [ 1 ], 0);
    });

    it('TINY-9945: Can delete content in non-empty element immediately after accordion using DELETE if caret is in middle', async () => {
      const editor = hook.editor();
      createAccordionWithThreeCharacterParagraphAfter(editor);
      TinySelections.setCursor(editor, [ 1, 0 ], 1);
      await pDoDelete();
      assertAccordionWithParagraphAfter(editor, 'ac');
      TinyAssertions.assertCursor(editor, [ 1, 0 ], 1);
    });

    it('TINY-9945: Should do nothing on DELETE if cursor is at end of non-empty immediately after accordion', async () => {
      const editor = hook.editor();
      createAccordionWithSingleCharacterParagraphAfter(editor);
      TinySelections.setCursor(editor, [ 1, 0 ], 'a'.length);
      await pDoDelete();
      assertAccordionWithSingleCharacterParagraphAfter(editor);
      TinyAssertions.assertCursor(editor, [ 1, 0 ], 'a'.length);
    });

    it('TINY-9945: Caret should move to end of accordion details and delete element after pressing BACKSPACE in empty element immediately after accordion', async () => {
      const editor = hook.editor();
      editor.setContent(`${getAccordionContent()}<p>&nbsp;</p><p>&nbsp;</p>`);
      TinySelections.setCursor(editor, [ 1 ], 0);
      await pDoBackspace();
      TinyAssertions.assertContent(editor, `${getAccordionContent()}<p>&nbsp;</p>`);
      TinyAssertions.assertCursor(editor, [ 0, 1, 0, 0 ], 'body'.length);
    });

    it('TINY-9945: Caret should move to end of accordion details after pressing BACKSPACE in non-empty element immediately after accordion if caret is at start', async () => {
      const editor = hook.editor();
      createAccordionWithSingleCharacterParagraphAfter(editor);
      TinySelections.setCursor(editor, [ 1, 0 ], 0);
      await pDoBackspace();
      assertAccordionWithSingleCharacterParagraphAfter(editor);
      TinyAssertions.assertCursor(editor, [ 0, 1, 0, 0 ], 'body'.length);
    });

    it('TINY-9950: Selected text should be removed as expected after pressing BACKSPACE in non-empty element immediately after accordion if making a selection from start', async () => {
      const editor = hook.editor();
      createAccordionWithThreeCharacterParagraphAfter(editor);
      TinySelections.setSelection(editor, [ 1, 0 ], 0, [ 1, 0 ], 'abc'.length);
      await pDoBackspace();
      assertAccordionWithEmptyParagraphAfter(editor);
      TinyAssertions.assertCursor(editor, [ 1 ], 0);
    });

    it('TINY-9950: Selected text should be removed as expected after pressing DELETE in non-empty element immediately after accordion if making a selection from start', async () => {
      const editor = hook.editor();
      createAccordionWithThreeCharacterParagraphAfter(editor);
      TinySelections.setSelection(editor, [ 1, 0 ], 0, [ 1, 0 ], 'abc'.length);
      await pDoDelete();
      assertAccordionWithEmptyParagraphAfter(editor);
      TinyAssertions.assertCursor(editor, [ 1 ], 0);
    });

    it('TINY-9950: Should forward delete element after pressing DELETE in empty element immediately after accordion if the element is not the last element of the editor', async () => {
      const editor = hook.editor();
      editor.setContent(`${getAccordionWithParagraphAfter('')}<p>xyz</p>`);
      TinySelections.setCursor(editor, [ 1, 0 ], 0);
      await pDoDelete();
      assertAccordionWithParagraphAfter(editor, 'xyz');
      TinyAssertions.assertCursor(editor, [ 1, 0 ], 0);
    });

    it('TINY-9950: Should do nothing after pressing DELETE in empty element immediately after accordion if the element is the last element of the editor', async () => {
      const editor = hook.editor();
      createAccordionWithEmptyParagraphAfter(editor);
      TinySelections.setCursor(editor, [ 1, 0 ], 0);
      await pDoDelete();
      assertAccordionWithEmptyParagraphAfter(editor);
      TinyAssertions.assertCursor(editor, [ 1 ], 0);
    });
  });

  context('Backspace/delete in element immediately before accordion', () => {
    const getAccordionWithParagraphBefore = (content: string): string =>
      `<p>${content}</p>${getAccordionContent()}`;

    const createAccordionWithParagraphBefore = (editor: Editor, content: string) =>
      editor.setContent(getAccordionWithParagraphBefore(content));
    const createAccordionWithEmptyParagraphBefore = (editor: Editor) => createAccordionWithParagraphBefore(editor, '');
    const createAccordionWithSingleCharacterParagraphBefore = (editor: Editor) => createAccordionWithParagraphBefore(editor, 'a');
    const createAccordionWithThreeCharacterParagraphBefore = (editor: Editor) => createAccordionWithParagraphBefore(editor, 'abc');

    const assertAccordionWithParagraphBefore = (editor: Editor, content: string) =>
      TinyAssertions.assertContent(editor, getAccordionWithParagraphBefore(content));
    const assertAccordionWithEmptyParagraphBefore = (editor: Editor) => assertAccordionWithParagraphBefore(editor, '&nbsp;');
    const assertAccordionWithSingleCharacterParagraphBefore = (editor: Editor) => assertAccordionWithParagraphBefore(editor, 'a');

    it('TINY-9950: Element is deleted after pressing BACKSPACE in empty element immediately before accordion and element is not the first element of the editor', async () => {
      const editor = hook.editor();
      editor.setContent(`<p>xyz</p>${getAccordionWithParagraphBefore('')}`);
      TinySelections.setCursor(editor, [ 1, 0 ], 0);
      await pDoBackspace();
      assertAccordionWithParagraphBefore(editor, 'xyz');
      TinyAssertions.assertCursor(editor, [ 0, 0 ], 'xyz'.length);
    });

    it('TINY-9950: Nothing happens after pressing BACKSPACE in empty element immediately before accordion and element is the first element of the editor', async () => {
      const editor = hook.editor();
      createAccordionWithEmptyParagraphBefore(editor);
      TinySelections.setCursor(editor, [ 0, 0 ], 0);
      await pDoBackspace();
      assertAccordionWithEmptyParagraphBefore(editor);
      TinyAssertions.assertCursor(editor, [ 0 ], 0);
    });

    it('TINY-9950: Nothing happens after pressing BACKSPACE in non-empty element immediately before accordion if caret is at start', async () => {
      const editor = hook.editor();
      createAccordionWithSingleCharacterParagraphBefore(editor);
      TinySelections.setCursor(editor, [ 0, 0 ], 0);
      await pDoBackspace();
      assertAccordionWithSingleCharacterParagraphBefore(editor);
      TinyAssertions.assertCursor(editor, [ 0, 0 ], 0);
    });

    it('TINY-9950: Content is deleted as expected after pressing BACKSPACE in non-empty element immediately before accordion if caret is at end', async () => {
      const editor = hook.editor();
      createAccordionWithSingleCharacterParagraphBefore(editor);
      TinySelections.setCursor(editor, [ 0, 0 ], 'a'.length);
      await pDoBackspace();
      assertAccordionWithEmptyParagraphBefore(editor);
      TinyAssertions.assertCursor(editor, [ 0 ], 0);
    });

    it('TINY-9950: Nothing happens after pressing DELETE in non-empty element immediately before accordion if caret at the end of element', async () => {
      const editor = hook.editor();
      createAccordionWithSingleCharacterParagraphBefore(editor);
      TinySelections.setCursor(editor, [ 0, 0 ], 'a'.length);
      await pDoDelete();
      assertAccordionWithSingleCharacterParagraphBefore(editor);
      TinyAssertions.assertCursor(editor, [ 0, 0 ], 'a'.length);
    });

    it('TINY-9950: Empty element is deleted and caret moves to start of summary after pressing DELETE in empty element immediately before accordion', async () => {
      const editor = hook.editor();
      editor.setContent(`<p>&nbsp;</p><p>&nbsp;</p>${getAccordionContent()}`);
      TinySelections.setCursor(editor, [ 1 ], 0);
      await pDoDelete();
      TinyAssertions.assertContent(editor, `<p>&nbsp;</p>${getAccordionContent()}`);
      TinyAssertions.assertCursor(editor, [ 1, 0, 0 ], 0);
    });

    it('TINY-9950: Content is deleted as expected after pressing DELETE in non-empty element immediately before accordion if caret is at start', async () => {
      const editor = hook.editor();
      createAccordionWithSingleCharacterParagraphBefore(editor);
      TinySelections.setCursor(editor, [ 0, 0 ], 0);
      await pDoDelete();
      assertAccordionWithEmptyParagraphBefore(editor);
      TinyAssertions.assertCursor(editor, [ 0 ], 0);
    });

    it('TINY-9950: Selected text is deleted as expected after pressing BACKSPACE in non-empty element immediately before accordion when making selection from start to end', async () => {
      const editor = hook.editor();
      createAccordionWithThreeCharacterParagraphBefore(editor);
      TinySelections.setSelection(editor, [ 0, 0 ], 0, [ 0, 0 ], 'abc'.length);
      await pDoBackspace();
      assertAccordionWithEmptyParagraphBefore(editor);
      TinyAssertions.assertCursor(editor, [ 0 ], 0);
    });

    it('TINY-9950: Selected text is deleted as expected after pressing DELETE in non-empty element immediately before accordion when making selection from start to end', async () => {
      const editor = hook.editor();
      createAccordionWithThreeCharacterParagraphBefore(editor);
      TinySelections.setSelection(editor, [ 0, 0 ], 0, [ 0, 0 ], 'abc'.length);
      await pDoDelete();
      assertAccordionWithEmptyParagraphBefore(editor);
      TinyAssertions.assertCursor(editor, [ 0 ], 0);
    });
  });
});
