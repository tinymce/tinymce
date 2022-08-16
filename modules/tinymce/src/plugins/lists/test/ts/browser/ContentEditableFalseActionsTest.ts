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
  readonly action: (editor: Editor) => any;
}

describe('browser.tinymce.plugins.lists.ContentEditableFalseActionsTest', () => {
  const hook = TinyHooks.bddSetupLight<Editor>({
    plugins: 'lists',
    toolbar: 'numlist bullist',
    base_url: '/project/tinymce/js/tinymce'
  }, [ Plugin ], true);

  const listTypes = [ 'ol', 'ul' ];

  const listContent =
    '<li contenteditable="true">editable</li>\n' +
    '<li>noneditable</li>\n' +
    '<li contenteditable="true">editable</li>\n' +
    '<li>noneditable</li>\n' +
    '<li contenteditable="true">editable</li>\n';

  const nonEditableListContents = (type: string): string =>
    '<' + type + ' contenteditable="false">\n' +
      listContent +
    '</' + type + '>';

  const divNestedNonEditableListContents = (type: string): string =>
    '<div contenteditable="true">\n' +
      '<' + type + ' contenteditable="false">\n' +
        listContent +
      '</' + type + '>\n' +
    '</div>';

  const nestedNonEditableListContents = (type1: string, type2: string): string =>
    '<div contenteditable="false">\n' +
      '<' + type1 + '>\n' +
        '<li>one\n' +
          '<' + type2 + ' contenteditable="false">\n' +
            listContent +
          '</' + type2 + '>\n' +
        '</li>\n' +
        '<li>two</li>\n' +
      '</' + type1 + '>\n' +
    '</div>';

  const nonEditableList: ListParameters[] = Arr.bind(listTypes, (type: string) => [{
    title: 'non-editable ' + type + ' list',
    content: nonEditableListContents(type),
    startPath: [ 1, 0 ]
  }]);

  const divNestedNonEditableList: ListParameters[] = Arr.bind(listTypes, (type: string) => [{
    title: 'non-editable div nested ' + type + ' list',
    content: divNestedNonEditableListContents(type),
    startPath: [ 0, 1, 0 ]
  }]);

  const nestedNonEditableList: ListParameters[] = Arr.bind(listTypes, (type1: string) =>
    Arr.bind(listTypes, (type2: string) => [{
      title: 'non-editable ' + type2 + ' list within editable ' + type1 + 'list',
      content: nestedNonEditableListContents(type1, type2),
      startPath: [ 1, 0, 0, 1, 0, 0 ]
    }])
  );

  const contentCombinations: ListParameters[] = Arr.flatten([
    nonEditableList,
    divNestedNonEditableList,
    nestedNonEditableList
  ]);

  const listActions: ListAction[] = [
    { title: 'Numbered list toolbar button', action: (editor: Editor) => TinyUiActions.clickOnToolbar(editor, 'button[aria-label="Numbered list"]') },
    { title: 'Bullet list toolbar button', action: (editor: Editor) => TinyUiActions.clickOnToolbar(editor, 'button[aria-label="Bullet list"]') },
    { title: 'RemoveList command', action: (editor: Editor) => editor.execCommand('RemoveList') },
    { title: 'InsertUnorderedList command', action: (editor: Editor) => editor.execCommand('InsertUnorderedList') },
    { title: 'InsertOrderedList command', action: (editor: Editor) => editor.execCommand('InsertOrderedList') },
    { title: 'InsertDefinitionList command', action: (editor: Editor) => editor.execCommand('InsertDefinitionList') },
    { title: 'mceListProps command', action: (editor: Editor) => editor.execCommand('mceListProps') },
    { title: 'mceListUpdate command', action: (editor: Editor) => editor.execCommand('mceListUpdate', false, { attrs: { contenteditable: 'true' }}) }
  ];

  Arr.each(listActions, (listAction: ListAction) => context(listAction.title, () =>
    Arr.each(contentCombinations, (list: ListParameters) =>
      it('TINY-8920: ' + listAction.title + ' is disabled when in ' + list.title, () => {
        const editor = hook.editor();
        editor.setContent(list.content);
        TinySelections.setCursor(editor, list.startPath, 0);
        listAction.action(editor);
        TinyAssertions.assertContent(editor, list.content);
      })
    )
  ));
});
