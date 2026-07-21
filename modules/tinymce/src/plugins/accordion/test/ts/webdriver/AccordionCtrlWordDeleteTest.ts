import { RealKeys } from '@ephox/agar';
import { describe, it } from '@ephox/bedrock-client';
import { PlatformDetection } from '@ephox/sand';
import { TinyAssertions, TinyHooks, TinySelections } from '@ephox/wrap-mcagar';

import type Editor from 'tinymce/core/api/Editor';

import AccordionPlugin from '../../../main/ts/Plugin';
import * as AccordionUtils from '../module/AccordionUtils';

type DeletionKey = 'Backspace' | 'Delete';
type ContentLocation = 'summary' | 'body';

interface AccordionSpec {
  summary?: string;
  body?: string;
}

// Ctrl/Alt word-deletion is performed natively by the browser, not by TinyMCE, and the
// result differs per OS/browser — so these cases require real webdriver keystrokes and
// cannot move to the synthetic browser AccordionBackspaceDeleteTest. See
// webdriver_conversion.md for the split rationale.
describe('webdriver.tinymce.plugins.accordion.AccordionCtrlWordDeleteTest', () => {
  const settings = {
    plugins: 'accordion',
    base_url: '/project/tinymce/js/tinymce',
    indent: false
  };
  const hook = TinyHooks.bddSetup<Editor>(settings, [ AccordionPlugin ], true);

  const platform = PlatformDetection.detect();
  const isSafari = platform.browser.isSafari();
  const isMacOS = platform.os.isMacOS();
  const isWindows = platform.os.isWindows();

  const getAccordionContent = ({ summary, body }: AccordionSpec = { summary: 'summary', body: '<p>body</p>' }): string =>
    `${AccordionUtils.createAccordion({ summary, body })}`;
  const assertAccordionContent = (editor: Editor, spec?: AccordionSpec) =>
    TinyAssertions.assertContent(editor, getAccordionContent(spec));
  const createAccordion = (editor: Editor, spec?: AccordionSpec) => {
    const content = getAccordionContent(spec);
    editor.setContent(content);
    return content;
  };

  const pDoCtrlBackspaceDelete = async (deletionKey: DeletionKey): Promise<void> => {
    await RealKeys.pSendKeysOn('iframe => body', [ RealKeys.combo(isMacOS ? { altKey: true } : { ctrlKey: true }, deletionKey) ]);
  };

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

    if (isSafari) {
      // Safari positions selection around format caret
      const expectedPath = isSummary ? [ 0, 0, 0 ] : [ 0, 1, 0, 0 ];
      const expectedOffset = isBackspace ? 6 : 2;

      TinyAssertions.assertCursor(editor, expectedPath, expectedOffset);
    } else {
      // 0 offset as selection positioned within format caret
      const expectedPath = isSummary ? [ 0, 0, 1, 0 ] : [ 0, 1, 0, 1, 0 ];
      const expectedOffset = 0;

      TinyAssertions.assertCursor(editor, expectedPath, expectedOffset);
    }
  };

  const testCtrlDeletionInSummary = (deletionKey: DeletionKey) => testCtrlDeletion(deletionKey, 'summary');
  it('TINY-9951: Can delete summary using Ctrl+Backspace', testCtrlDeletionInSummary('Backspace'));
  it('TINY-9951: Can delete summary using Ctrl+Delete', testCtrlDeletionInSummary('Delete'));

  const testCtrlDeletionInBody = (deletionKey: DeletionKey) => testCtrlDeletion(deletionKey, 'body');
  it('TINY-9951: Can delete body using Ctrl+Backspace', testCtrlDeletionInBody('Backspace'));
  it('TINY-9951: Can delete body using Ctrl+Delete', testCtrlDeletionInBody('Delete'));
});
