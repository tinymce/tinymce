import { UiFinder } from '@ephox/agar';
import { context, describe, it } from '@ephox/bedrock-client';
import { Arr } from '@ephox/katamari';
import { SugarBody } from '@ephox/sugar';
import { TinyAssertions, TinyHooks, TinySelections, TinyUiActions } from '@ephox/wrap-mcagar';

import Editor from 'tinymce/core/api/Editor';
import Plugin from 'tinymce/plugins/lists/Plugin';

interface ListParameters {
  readonly title: string;
  readonly content: string;
  readonly startPath: number[];
}

describe('browser.tinymce.plugins.lists.ContentEditableFalseActionsTest', () => {
  const hook = TinyHooks.bddSetupLight<Editor>({
    plugins: 'lists',
    toolbar: 'numlist bullist',
    base_url: '/project/tinymce/js/tinymce'
  }, [ Plugin ], true);

  const listTypes = [ 'ol', 'ul' ];

  const listContent = `<li contenteditable="true">editable</li>
<li>noneditable</li>
<li contenteditable="true">editable</li>
<li>noneditable</li>
<li contenteditable="true">editable</li>`;

  const nonEditableListContents = (type: string): string =>
    `<${type} contenteditable="false">
${listContent}
</${type}>`;

  const divNestedNonEditableListContents = (type: string): string =>
    `<div contenteditable="true">
<${type} contenteditable="false">
${listContent}
</${type}>
</div>`;

  const nestedNonEditableListContents = (type1: string, type2: string): string =>
    `<div contenteditable="false">
<${type1}>
<li>one
<${type2} contenteditable="false">
${listContent}
</${type2}>
</li>
<li>two</li>
</${type1}>
</div>`;

  const nonEditableList: ListParameters[] = Arr.map(listTypes, (type) => ({
    title: `non-editable ${type} list`,
    content: nonEditableListContents(type),
    startPath: [ 1, 0 ]
  }));

  const divNestedNonEditableList: ListParameters[] = Arr.map(listTypes, (type) => ({
    title: `non-editable div nested ${type} list`,
    content: divNestedNonEditableListContents(type),
    startPath: [ 0, 1, 0 ]
  }));

  const nestedNonEditableList: ListParameters[] = Arr.bind(listTypes, (type1) =>
    Arr.map(listTypes, (type2) => ({
      title: `non-editable ${type2} list within editable ${type1} list`,
      content: nestedNonEditableListContents(type1, type2),
      startPath: [ 1, 0, 0, 1, 0, 0 ]
    }))
  );

  const contentCombinations: ListParameters[] = [
    ...nonEditableList,
    ...divNestedNonEditableList,
    ...nestedNonEditableList
  ];

  const checkToolbarDisabled = (editor: Editor, listType: string) => {
    UiFinder.exists(SugarBody.body(), `button[aria-label="${listType}"][aria-disabled="true"]`);
    TinyUiActions.clickOnToolbar(editor, `button[aria-label="${listType}"][aria-disabled="true"]`);
  };

  const performActionAndAssertNoChange = (list: ListParameters, action: (editor: Editor) => any) => {
    const editor = hook.editor();
    editor.setContent(list.content);
    TinySelections.setCursor(editor, list.startPath, 0);
    action(editor);
    TinyAssertions.assertContent(editor, list.content);
  };

  Arr.each(contentCombinations, (list) =>
    context(list.title, () => {
      it(`TINY-8920: Pressing Numbered list toolbar button is disabled when in ${list.title}`, () =>
        performActionAndAssertNoChange(list, (editor: Editor) => checkToolbarDisabled(editor, 'Numbered list'))
      );

      it(`TINY-8920: Pressing Bullet list toolbar button is disabled when in ${list.title}`, () =>
        performActionAndAssertNoChange(list, (editor: Editor) => checkToolbarDisabled(editor, 'Bullet list'))
      );

      it(`TINY-8920: Executing RemoveList command is disabled when in ${list.title}`, () =>
        performActionAndAssertNoChange(list, (editor: Editor) => editor.execCommand('RemoveList'))
      );

      it(`TINY-8920: Executing InsertUnorderedList command is disabled when in ${list.title}`, () =>
        performActionAndAssertNoChange(list, (editor: Editor) => editor.execCommand('InsertUnorderedList'))
      );

      it(`TINY-8920: Executing InsertOrderedList command is disabled when in ${list.title}`, () =>
        performActionAndAssertNoChange(list, (editor: Editor) => editor.execCommand('InsertOrderedList'))
      );

      it(`TINY-8920: Executing InsertDefinitionList command is disabled when in ${list.title}`, () =>
        performActionAndAssertNoChange(list, (editor: Editor) => editor.execCommand('InsertDefinitionList'))
      );

      it(`TINY-8920: Executing mceListProps command is disabled when in ${list.title}`, () =>
        performActionAndAssertNoChange(list, (editor: Editor) => editor.execCommand('mceListProps'))
      );

      it(`TINY-8920: Executing mceListUpdate command is disabled when in ${list.title}`, () =>
        performActionAndAssertNoChange(list, (editor: Editor) => editor.execCommand('mceListUpdate', false, { attrs: { contenteditable: 'true' }}))
      );
    })
  );

  const testNonEditableBlocksIgnore = (command: 'InsertOrderedList' | 'InsertUnorderedList'): void => {
    const editor = hook.editor();
    const initialContent = '<p>a</p>\n<p contenteditable="false">b</p>\n<p>c</p>';
    const tag = command === 'InsertOrderedList' ? 'ol' : 'ul';
    const expectedContent = `<${tag}>\n<li>a</li>\n</${tag}>\n<p contenteditable="false">b</p>\n<${tag}>\n<li>c</li>\n</${tag}>`;

    editor.setContent(initialContent);
    TinySelections.setSelection(editor, [ 0, 0 ], 0, [ 2, 0 ], 1);
    editor.execCommand(command);
    TinyAssertions.assertContent(editor, expectedContent);
  };

  it('TINY-9823: InsertOrderedList command should ignore noneditable blocks', () => {
    testNonEditableBlocksIgnore('InsertOrderedList');
  });

  it('TINY-9823: InsertUnorderedList command should ignore noneditable blocks', () => {
    testNonEditableBlocksIgnore('InsertUnorderedList');
  });

  const testEditableBlockInsideNonEditableBlock = (command: 'InsertOrderedList' | 'InsertUnorderedList'): void => {
    const editor = hook.editor();
    editor.getBody().contentEditable = 'false';
    const initialContent = '<div contenteditable="true"><p>a</p></div>';
    const tag = command === 'InsertOrderedList' ? 'ol' : 'ul';
    const expectedContent = `<div contenteditable="true">\n<${tag}>\n<li>a</li>\n</${tag}>\n</div>`;

    editor.setContent(initialContent);
    TinySelections.setSelection(editor, [ 0, 0, 0 ], 0, [ 0, 0, 0 ], 1);
    editor.execCommand(command);
    TinyAssertions.assertContent(editor, expectedContent);
    editor.getBody().contentEditable = 'true';
  };

  it('TINY-10000: InsertOrderedList command should create a list in an editable block inside a non-editable block', () => {
    testEditableBlockInsideNonEditableBlock('InsertOrderedList');
  });

  it('TINY-10000: InsertUnorderedList command should create a list in an editable block inside a non-editable block', () => {
    testEditableBlockInsideNonEditableBlock('InsertUnorderedList');
  });
});
