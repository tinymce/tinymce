import { describe, it } from '@ephox/bedrock-client';
import { Arr } from '@ephox/katamari';
import { TinyAssertions, TinyHooks, TinySelections, TinyUiActions } from '@ephox/wrap-mcagar';

import Editor from 'tinymce/core/api/Editor';
import Plugin from 'tinymce/plugins/lists/Plugin';

describe('browser.tinymce.plugins.lists.ContentEditableFalseActionsTest', () => {
  const hook = TinyHooks.bddSetupLight<Editor>({
    plugins: 'lists',
    toolbar: 'numlist bullist',
    base_url: '/project/tinymce/js/tinymce'
  }, [ Plugin ], true);

  interface ListParameters {
    title: string,
    content: string;
    startPath: number[];
    endPath: number[];
  }

  const listTypes = [ 'ol', 'ul' ];

  const listContent =
  '<li contenteditable="true">editable</li>\n' +
  '<li>noneditable</li>\n' +
  '<li contenteditable="true">editable</li>\n';

  const nonEditableListContents = (type: string) =>
  '<' + type + ' contenteditable="false">\n' +
    listContent +
  '</' + type + '>';

  const divNestedNonEditableListContents = (type: string) =>
  '<div contenteditable="true">\n' +
    '<' + type + ' contenteditable="false">\n' +
      listContent +
    '</' + type + '>\n' +
  '</div>';

  const nestedNonEditableListContents = (type1: string, type2: string) =>
  '<' + type1 + ' contenteditable="true">\n' +
    '<li contenteditable="true">one</li>\n' +
    '<li>nested\n' +
      '<' + type2 + ' contenteditable="false">\n' +
        '<li contenteditable="true">two</li>\n' +
        '<li contenteditable="true">three</li>\n' +
        '<li contenteditable="true">four</li>\n' +
      '</' + type2 + '>\n' +
    '</li>\n' +
    '<li>three</li>\n' +
    '<li>four</li>\n' +
  '</' + type1 + '>';

  const nonEditableList: ListParameters[] = Arr.bind(listTypes, (type: string) => [{
    title: 'non-editable ' + type + ' list',
    content: nonEditableListContents(type),
    startPath: [ 1, 0, 0 ],
    endPath: [ 0, 0, 0 ]
  }]);

  const divNestedNonEditableList: ListParameters[] = Arr.bind(listTypes, (type: string) => [{
    title: 'non-editable div nested ' + type + ' list',
    content: divNestedNonEditableListContents(type),
    startPath: [ 0, 1, 0 ],
    endPath: [ 0, 0, 0 ]
  }]);

  const nestedNonEditableList: ListParameters[] = Arr.bind(listTypes, (type1: string) =>
    Arr.bind(listTypes, (type2: string) => [{
      title: 'non-editable ' + type2 + ' list within editable ' + type1 + 'list',
      content: nestedNonEditableListContents(type1, type2),
      startPath: [ 0, 1, 1, 1 ],
      endPath: [ 0, 1, 1, 1 ]
  }]));

  const contentCombinations = Arr.flatten([
    nonEditableList,
    divNestedNonEditableList,
    nestedNonEditableList
  ]);

  interface ListAction {
    title: string;
    action: (editor: Editor) => any;
  }

  const listActions: ListAction[] = [
    {title: 'Numbered list toolbar button', action: (editor: Editor) => TinyUiActions.clickOnToolbar(editor, 'button[aria-label="Numbered list"]')},
    {title: 'Bullet list toolbar button', action:  (editor: Editor) => TinyUiActions.clickOnToolbar(editor, 'button[aria-label="Bullet list"]')},
    {title: 'RemoveList command', action:  (editor: Editor) => editor.execCommand('RemoveList')},
    {title: 'InsertUnorderedList command', action:  (editor: Editor) => editor.execCommand('InsertUnorderedList')},
    {title: 'InsertOrderedList command', action:  (editor: Editor) => editor.execCommand('InsertOrderedList')},
    {title: 'InsertDefinitionList command', action:  (editor: Editor) => editor.execCommand('InsertDefinitionList')},
    {title: 'mceListProps command', action:  (editor: Editor) => editor.execCommand('mceListProps')},
    {title: 'mceListUpdate command', action:  (editor: Editor) => editor.execCommand('mceListUpdate', false, { attrs: { contenteditable: 'true' }})}
  ];

  listActions.forEach((listAction: ListAction) =>
    contentCombinations.forEach((list: ListParameters) =>
      it('TINY-8920: ' + listAction.title + ' is disabled when in ' + list.title, () => {
        const editor = hook.editor();
        editor.setContent(list.content);
        TinySelections.setCursor(editor, list.startPath, 0);
        listAction.action(editor);
        TinyAssertions.assertCursor(editor, list.endPath, 0);
        TinyAssertions.assertContent(editor, list.content);
      })
    )
  );
});
