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
  ctrl?: boolean;
  alt?: boolean;
  meta?: boolean;
}

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

  const platform = PlatformDetection.detect();
  const isSafari = platform.browser.isSafari();
  const isMacOS = platform.os.isMacOS();

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

  context('Backspace should not remove accordion elements', () => {
    it('TINY-9731: Prevent BACKSPACE from removing accordion body if a cursor is after the accordion', async () => {
      const editor = hook.editor();
      editor.setContent(AccordionUtils.createAccordion({ body: '<p><br></p>' }) + '<p><br></p>');
      TinySelections.setCursor(editor, [ 1, 0 ], 0);
      await pDoBackspace();
      TinyAssertions.assertContentPresence(editor, { 'details > p': 1 });
      TinyAssertions.assertCursor(editor, [ 0, 1 ], 0);
    });

    const testPreventBodyDeletion = async (editor: Editor, deletionKey: DeletionKey) => {
      createAccordion(editor, { body: '<p><br></p>' });
      TinySelections.setCursor(editor, [ 0, 1 ], 0);
      await pDoBackspaceDelete(deletionKey);
      TinyAssertions.assertContentPresence(editor, { 'details > p': 1 });
      TinyAssertions.assertCursor(editor, [ 0, 1 ], 0);
    };

    it('TINY-9884: Prevent BACKSPACE from removing accordion body if a cursor is in the accordion body', () => testPreventBodyDeletion(hook.editor(), 'Backspace'));
    it('TINY-9951: Prevent DELETE from removing accordion body if a cursor is in the accordion body', () => testPreventBodyDeletion(hook.editor(), 'Delete'));

    const testPreventSummaryDeletion = async (editor: Editor, deletionKey: DeletionKey) => {
      createAccordion(editor, { summary: '' });
      TinySelections.setCursor(editor, [ 0, 0 ], 0);
      await pDoBackspaceDelete(deletionKey);
      TinyAssertions.assertContentPresence(editor, { 'details > summary': 1 });
      // TINY-9951: Safari override results in a different cursor position due to bookmark
      TinyAssertions.assertCursor(editor, isSafari ? [ 0, 0, 0 ] : [ 0, 0 ], 0);
    };

    it('TINY-9884: Prevent BACKSPACE from removing summary', () => testPreventSummaryDeletion(hook.editor(), 'Backspace'));
    it('TINY-9951: Prevent DELETE from removing summary', () => testPreventSummaryDeletion(hook.editor(), 'Delete'));

    const testPreventSummaryBodyDeletion = async (editor: Editor, deletionKey: DeletionKey) => {
      createAccordion(editor);
      TinySelections.setSelection(editor, [ 0, 0, 0 ], 'sum'.length, [ 0, 1, 0 ], 'bo'.length);
      await pDoBackspaceDelete(deletionKey);
      TinyAssertions.assertContentPresence(editor, { 'details > summary': 1, 'details > p': 1 });
    };

    it('TINY-9884: Prevent BACKSPACE from removing summary when summary and details content are selected', () => testPreventSummaryBodyDeletion(hook.editor(), 'Backspace'));
    it('TINY-9951: Prevent DELETE from removing summary when summary and details content are selected', () => testPreventSummaryBodyDeletion(hook.editor(), 'Delete'));
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
        assertAccordionContent(editor, { summary: '', body: '<p>body</p>' });
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
        assertAccordionContent(editor, { summary: '', body: '<p>body</p>' });
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
        TinySelections.setCursor(editor, [ 0, 1, 0 ], 'body'.length);
        await pDoBackspace();
        assertAccordionContent(editor, { summary: 'summary', body: '<p>bod</p>' });
        TinyAssertions.assertCursor(editor, [ 0, 1, 0 ], 'bod'.length);
      });

      it('TINY-9951: Deleting content in body by pressing BACKSPACE should work as expected if caret in middle of body content', async () => {
        const editor = hook.editor();
        createAccordion(editor);
        TinySelections.setCursor(editor, [ 0, 1, 0 ], 'bo'.length);
        await pDoBackspace();
        assertAccordionContent(editor, { summary: 'summary', body: '<p>bdy</p>' });
        TinyAssertions.assertCursor(editor, [ 0, 1, 0 ], 'b'.length);
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
        TinyAssertions.assertCursor(editor, [ 0, 1, 0 ], 0);
      });

      it('TINY-9951: Deleting content in body by pressing DELETE should work as expected if caret in middle of body content', async () => {
        const editor = hook.editor();
        createAccordion(editor);
        TinySelections.setCursor(editor, [ 0, 1, 0 ], 'bo'.length);
        await pDoDelete();
        assertAccordionContent(editor, { summary: 'summary', body: '<p>boy</p>' });
        TinyAssertions.assertCursor(editor, [ 0, 1, 0 ], 'bo'.length);
      });

      it('TINY-9951: Nothing should happen after pressing DELETE if caret at end of body', async () => {
        const editor = hook.editor();
        createAccordion(editor);
        TinySelections.setCursor(editor, [ 0, 1, 0 ], 'body'.length);
        await pDoDelete();
        assertAccordionContent(editor);
        TinyAssertions.assertCursor(editor, [ 0, 1, 0 ], 'body'.length);
      });
    });

    context('With a ranged selection', () => {
      const createAccordionAndSelectAll = (editor: Editor, location: ContentLocation) => {
        createAccordion(editor);
        if (location === 'summary') {
          TinySelections.setSelection(editor, [ 0, 0, 0 ], 0, [ 0, 0, 0 ], 'summary'.length);
        } else {
          TinySelections.setSelection(editor, [ 0, 1, 0 ], 0, [ 0, 1, 0 ], 'body'.length);
        }
      };

      const testDeleteAllContentInAccordion = async (editor: Editor, contentLocation: ContentLocation, deletionKey: DeletionKey) => {
        createAccordionAndSelectAll(editor, contentLocation);
        await pDoBackspaceDelete(deletionKey);
        const isLocationSummary = contentLocation === 'summary';
        TinyAssertions.assertContent(editor, AccordionUtils.createAccordion(isLocationSummary ? { summary: '', body: '<p>body</p>' } : { summary: 'summary', body: '<p></p>' }));
        TinyAssertions.assertCursor(editor, isLocationSummary ? [ 0, 0 ] : [ 0, 1 ], 0);
      };

      it('TINY-9945: Can select all content in summary and delete it using Backspace', () => testDeleteAllContentInAccordion(hook.editor(), 'summary', 'Backspace'));
      it('TINY-9945: Can select all content in summary and delete it using Delete', () => testDeleteAllContentInAccordion(hook.editor(), 'summary', 'Delete'));
      it('TINY-9945: Can select all content in body and delete it using Backspace', () => testDeleteAllContentInAccordion(hook.editor(), 'body', 'Backspace'));
      it('TINY-9945: Can select all content in body and delete it using Delete', () => testDeleteAllContentInAccordion(hook.editor(), 'body', 'Delete'));

      const testDeleteSelectionFromStartInSummary = async (editor: Editor, deletionKey: DeletionKey) => {
        createAccordion(editor);
        TinySelections.setSelection(editor, [ 0, 0, 0 ], 0, [ 0, 0, 0 ], 'sum'.length);
        await pDoBackspaceDelete(deletionKey);
        assertAccordionContent(editor, { summary: 'mary', body: '<p>body</p>' });
        TinyAssertions.assertCursor(editor, [ 0, 0, 0 ], 0);
      };

      it('TINY-9951: Can select content from start in summary and delete it using Backspace', () => testDeleteSelectionFromStartInSummary(hook.editor(), 'Backspace'));
      it('TINY-9951: Can select content from start in summary and delete it using Delete', () => testDeleteSelectionFromStartInSummary(hook.editor(), 'Delete'));

      const testDeleteSelectionInMiddleInSummary = async (editor: Editor, deletionKey: DeletionKey) => {
        createAccordion(editor);
        TinySelections.setSelection(editor, [ 0, 0, 0 ], 'su'.length, [ 0, 0, 0 ], 'summ'.length);
        await pDoBackspaceDelete(deletionKey);
        assertAccordionContent(editor, { summary: 'suary', body: '<p>body</p>' });
        TinyAssertions.assertCursor(editor, [ 0, 0, 0 ], 'su'.length);
      };

      it('TINY-9951: Can select content in middle in summary and delete it using Backspace', () => testDeleteSelectionInMiddleInSummary(hook.editor(), 'Backspace'));
      it('TINY-9951: Can select content in middle in summary and delete it using Delete', () => testDeleteSelectionInMiddleInSummary(hook.editor(), 'Delete'));

      const testDeleteSelectionFromEndInSummary = async (editor: Editor, deletionKey: DeletionKey) => {
        createAccordion(editor);
        TinySelections.setSelection(editor, [ 0, 0, 0 ], 'sum'.length, [ 0, 0, 0 ], 'summary'.length);
        await pDoBackspaceDelete(deletionKey);
        assertAccordionContent(editor, { summary: 'sum', body: '<p>body</p>' });
        TinyAssertions.assertCursor(editor, [ 0, 0, 0 ], 'sum'.length);
      };

      it('TINY-9951: Can select content from end in summary and delete it using Backspace', () => testDeleteSelectionFromEndInSummary(hook.editor(), 'Backspace'));
      it('TINY-9951: Can select content from end in summary and delete it using Delete', () => testDeleteSelectionFromEndInSummary(hook.editor(), 'Delete'));

      const testDeleteSelectionFromStartInBody = async (editor: Editor, deletionKey: DeletionKey) => {
        createAccordion(editor);
        TinySelections.setSelection(editor, [ 0, 1, 0 ], 0, [ 0, 1, 0 ], 'bo'.length);
        await pDoBackspaceDelete(deletionKey);
        assertAccordionContent(editor, { summary: 'summary', body: '<p>dy</p>' });
        TinyAssertions.assertCursor(editor, [ 0, 1, 0 ], 0);
      };

      it('TINY-9951: Can select content from start in body and delete it using Backspace', () => testDeleteSelectionFromStartInBody(hook.editor(), 'Backspace'));
      it('TINY-9951: Can select content from start in body and delete it using Delete', () => testDeleteSelectionFromStartInBody(hook.editor(), 'Delete'));

      const testDeleteSelectionInMiddleInBody = async (editor: Editor, deletionKey: DeletionKey) => {
        createAccordion(editor);
        TinySelections.setSelection(editor, [ 0, 1, 0 ], 'b'.length, [ 0, 1, 0 ], 'bod'.length);
        await pDoBackspaceDelete(deletionKey);
        assertAccordionContent(editor, { summary: 'summary', body: '<p>by</p>' });
        TinyAssertions.assertCursor(editor, [ 0, 1, 0 ], 'b'.length);
      };

      it('TINY-9951: Can select content in middle in body and delete it using Backspace', () => testDeleteSelectionInMiddleInBody(hook.editor(), 'Backspace'));
      it('TINY-9951: Can select content in middle in body and delete it using Delete', () => testDeleteSelectionInMiddleInBody(hook.editor(), 'Delete'));

      const testDeleteSelectionFromEndInBody = async (editor: Editor, deletionKey: DeletionKey) => {
        createAccordion(editor);
        TinySelections.setSelection(editor, [ 0, 1, 0 ], 'bo'.length, [ 0, 1, 0 ], 'body'.length);
        await pDoBackspaceDelete(deletionKey);
        assertAccordionContent(editor, { summary: 'summary', body: '<p>bo</p>' });
        TinyAssertions.assertCursor(editor, [ 0, 1, 0 ], 'bo'.length);
      };

      it('TINY-9951: Can select content from end in body and delete it using Backspace', () => testDeleteSelectionFromEndInBody(hook.editor(), 'Backspace'));
      it('TINY-9951: Can select content from end in body and delete it using Delete', () => testDeleteSelectionFromEndInBody(hook.editor(), 'Delete'));
    });

    context('Using ranged deletion keyboard shortcuts', () => {
      const pDoCtrlBackspaceDelete = (deletionKey: DeletionKey) => pDoBackspaceDelete(deletionKey, isMacOS ? { alt: true } : { ctrl: true });

      const testCtrlDeletionInSummary = async (editor: Editor, deletionKey: DeletionKey) => {
        createAccordion(editor);
        TinySelections.setCursor(editor, [ 0, 0, 0 ], deletionKey === 'Backspace' ? 'summary'.length : 0);
        await pDoCtrlBackspaceDelete(deletionKey);
        assertAccordionContent(editor, { summary: '', body: '<p>body</p>' });
        // TINY-9302: Extra format caret added when using keyboard shortcut ranged deletion
        TinyAssertions.assertCursor(editor, [ 0, 0, 0, 0 ], 0);
      };

      it('TINY-9951: Can delete summary using Ctrl+Backspace', () => testCtrlDeletionInSummary(hook.editor(), 'Backspace'));
      it('TINY-9951: Can delete summary using Ctrl+Delete', () => testCtrlDeletionInSummary(hook.editor(), 'Delete'));

      const testCtrlDeletionInBody = async (editor: Editor, deletionKey: DeletionKey) => {
        createAccordion(editor);
        TinySelections.setCursor(editor, [ 0, 1, 0 ], deletionKey === 'Backspace' ? 'body'.length : 0);
        await pDoCtrlBackspaceDelete(deletionKey);
        assertAccordionContent(editor, { summary: 'summary', body: '<p></p>' });
        // TINY-9302: Extra format caret added when using keyboard shortcut ranged deletion
        TinyAssertions.assertCursor(editor, [ 0, 1, 0, 0 ], 0);
      };

      it('TINY-9951: Can delete body using Ctrl+Backspace', () => testCtrlDeletionInBody(hook.editor(), 'Backspace'));
      it('TINY-9951: Can delete body using Ctrl+Delete', () => testCtrlDeletionInBody(hook.editor(), 'Delete'));
    });
  });

  context('Backspace/delete in element immediately after accordion', () => {
    const getAccordionWithParagraphAfter = (content: string): string =>
      `${getAccordionContent()}<p>${content}</p>`;

    const createAccordionWithParagraphAfter = (editor: Editor, content: string) =>
      editor.setContent(getAccordionWithParagraphAfter(content));
    const createAccordionWithSingleCharacterParagraphAfter = (editor: Editor) => createAccordionWithParagraphAfter(editor, 'a');
    const createAccordionWithThreeCharacterParagraphAfter = (editor: Editor) => createAccordionWithParagraphAfter(editor, 'abc');
    const createAccordionWithEmptyParagraphAfter = (editor: Editor) => createAccordionWithParagraphAfter(editor, '');

    const assertAccordionWithParagraphAfter = (editor: Editor, content: string) =>
      TinyAssertions.assertContent(editor, getAccordionWithParagraphAfter(content));
    const assertAccordionWithSingleCharacterParagraphAfter = (editor: Editor) => assertAccordionWithParagraphAfter(editor, 'a');
    const assertAccordionWithEmptyParagraphAfter = (editor: Editor) => assertAccordionWithParagraphAfter(editor, '');

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
      createAccordionWithEmptyParagraphAfter(editor);
      TinySelections.setCursor(editor, [ 1, 0 ], 0);
      await pDoBackspace();
      assertAccordionContent(editor);
      TinyAssertions.assertCursor(editor, [ 0, 1, 0 ], 'body'.length);
    });

    it('TINY-9945: Caret should move to end of accordion details after pressing BACKSPACE in non-empty element immediately after accordion if caret is at start', async () => {
      const editor = hook.editor();
      createAccordionWithSingleCharacterParagraphAfter(editor);
      TinySelections.setCursor(editor, [ 1, 0 ], 0);
      await pDoBackspace();
      assertAccordionWithSingleCharacterParagraphAfter(editor);
      TinyAssertions.assertCursor(editor, [ 0, 1, 0 ], 'body'.length);
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
    const assertAccordionWithEmptyParagraphBefore = (editor: Editor) => assertAccordionWithParagraphBefore(editor, '');
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
      createAccordionWithEmptyParagraphBefore(editor);
      TinySelections.setCursor(editor, [ 0, 0 ], 0);
      await pDoDelete();
      assertAccordionContent(editor);
      TinyAssertions.assertCursor(editor, [ 0, 0, 0 ], 0);
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
