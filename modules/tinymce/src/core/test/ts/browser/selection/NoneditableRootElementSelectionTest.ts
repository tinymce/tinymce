import { afterEach, beforeEach, context, describe, it } from '@ephox/bedrock-client';
import { TinyAssertions, TinyContentActions, TinyHooks, TinySelections } from '@ephox/wrap-mcagar';

import Editor from 'tinymce/core/api/Editor';

describe('browser.tinymce.selection.NoneditableRootElementSelectionTest', () => {
  const hook = TinyHooks.bddSetupLight<Editor>({
    indent: false,
    base_url: '/project/tinymce/js/tinymce'
  }, []);

  beforeEach(() => {
    const editor = hook.editor();
    editor.getBody().contentEditable = 'false';
  });

  afterEach(() => {
    const editor = hook.editor();
    editor.getBody().contentEditable = 'true';
  });

  const assertElementSelection = (editor: Editor, expected: number) => {
    TinyAssertions.assertContentPresence(editor, {
      '[data-mce-selected]': expected
    });
  };

  context('Clicking elements', () => {
    const testClickElement = (testCase: { input: string; selector: string; expected: number }) => () => {
      const editor = hook.editor();
      editor.setContent(testCase.input);
      TinyContentActions.trueClickOn(editor, testCase.selector);
      assertElementSelection(editor, testCase.expected);
    };

    it('TINY-9473: Clicking on a image inside a noneditable root should not select it', testClickElement({
      input: '<p><img src="#" width="100" height="100"></p>',
      selector: 'img',
      expected: 0
    }));

    it('TINY-9473: Clicking on a hr inside a noneditable root should not select it', testClickElement({
      input: '<hr>',
      selector: 'hr',
      expected: 0
    }));

    it('TINY-9473: Clicking on a cef inside a noneditable root should not select it', testClickElement({
      input: '<div contenteditable="false">noneditable</div>',
      selector: 'div',
      expected: 0
    }));

    it('TINY-9473: Clicking on a cef inside a editable element inside a noneditable root should select it', testClickElement({
      input: '<div contenteditable="true"><div contenteditable="false">editable</div></div>',
      selector: 'div[contenteditable="false"]',
      expected: 1
    }));
  });

  context('Selecting elements using selection apis', () => {
    const testSelectElement = (testCase: { input: string; selector: string; expected: number }) => () => {
      const editor = hook.editor();
      editor.setContent(testCase.input);
      TinySelections.select(editor, testCase.selector, []);
      editor.nodeChanged(); // Workaround for the async nature of selectionchange
      assertElementSelection(editor, testCase.expected);
    };

    it('TINY-9473: Selecting a image inside a noneditable root should not select it', testSelectElement({
      input: '<p><img src="#" width="100" height="100"></p>',
      selector: 'img',
      expected: 0
    }));

    it('TINY-9473: Selecting a hr inside a noneditable root should not select it', testSelectElement({
      input: '<hr>',
      selector: 'hr',
      expected: 0
    }));

    it('TINY-9473: Selecting a cef inside a noneditable root should not select it', testSelectElement({
      input: '<div contenteditable="false"></div>',
      selector: 'div',
      expected: 0
    }));

    it('TINY-9473: Selecting a cef inside a editable element inside a noneditable root should select it', testSelectElement({
      input: '<div contenteditable="true"><div contenteditable="false">editable</div></div>',
      selector: 'div[contenteditable="false"]',
      expected: 1
    }));

    it('TINY-9473: Selecting a element inside a table inside a noneditable root should not select it', testSelectElement({
      input: '<table><tbody><tr><td><em>table</em></td></tr></tbody></table>',
      selector: 'em',
      expected: 0
    }));
  });
});
