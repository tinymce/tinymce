import { context, describe, it } from '@ephox/bedrock-client';
import { Arr } from '@ephox/katamari';
import { TinyAssertions, TinyHooks, TinySelections, TinyUiActions } from '@ephox/wrap-mcagar';

import Editor from 'tinymce/core/api/Editor';
import Plugin from 'tinymce/plugins/lists/Plugin';

interface ListParameters {
  readonly title: string;
  readonly content: string;
  readonly startPath: number[];
}

interface ListAction {
  readonly title: string;
  readonly action: (editor: Editor) => Promise<any> | boolean;
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

  const nonEditableList: ListParameters[] = Arr.bind(listTypes, (type) => [{
    title: `non-editable ${type} list`,
    content: nonEditableListContents(type),
    startPath: [ 1, 0 ]
  }]);

  const divNestedNonEditableList: ListParameters[] = Arr.bind(listTypes, (type) => [{
    title: `non-editable div nested ${type} list`,
    content: divNestedNonEditableListContents(type),
    startPath: [ 0, 1, 0 ]
  }]);

  const nestedNonEditableList: ListParameters[] = Arr.bind(listTypes, (type1) =>
    Arr.bind(listTypes, (type2) => [{
      title: `non-editable ${type2} list within editable ${type1} list`,
      content: nestedNonEditableListContents(type1, type2),
      startPath: [ 1, 0, 0, 1, 0, 0 ]
    }])
  );

  const contentCombinations: ListParameters[] = Arr.flatten([
    nonEditableList,
    divNestedNonEditableList,
    nestedNonEditableList
  ]);

  const pClickToolbarDisabled = (editor: Editor, listType: string) => {
    TinyUiActions.clickOnToolbar(editor, `button[aria-label="${listType}"]`);
    return TinyUiActions.pWaitForUi(editor, `button[aria-label="${listType}"][aria-pressed="true"][aria-disabled="true"]`);
  };

  const listActions: ListAction[] = [
    { title: 'Numbered list toolbar button', action: (editor: Editor) => pClickToolbarDisabled(editor, 'Numbered list') },
    { title: 'Bullet list toolbar button', action: (editor: Editor) => pClickToolbarDisabled(editor, 'Bullet list') },
    { title: 'RemoveList command', action: (editor: Editor) => editor.execCommand('RemoveList') },
    { title: 'InsertUnorderedList command', action: (editor: Editor) => editor.execCommand('InsertUnorderedList') },
    { title: 'InsertOrderedList command', action: (editor: Editor) => editor.execCommand('InsertOrderedList') },
    { title: 'InsertDefinitionList command', action: (editor: Editor) => editor.execCommand('InsertDefinitionList') },
    { title: 'mceListProps command', action: (editor: Editor) => editor.execCommand('mceListProps') },
    { title: 'mceListUpdate command', action: (editor: Editor) => editor.execCommand('mceListUpdate', false, { attrs: { contenteditable: 'true' }}) }
  ];

  Arr.each(listActions, (listAction) =>
    context(listAction.title, () =>
      Arr.each(contentCombinations, (list) =>
        it(`TINY-8920: Pressing ${listAction.title} is disabled when in ${list.title}`, async () => {
          const editor = hook.editor();
          editor.setContent(list.content);
          TinySelections.setCursor(editor, list.startPath, 0);
          await listAction.action(editor);
          TinyAssertions.assertContent(editor, list.content);
        })
      )
    )
  );
});
