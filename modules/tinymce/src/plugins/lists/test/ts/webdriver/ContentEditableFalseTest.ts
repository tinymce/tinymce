import { RealKeys } from '@ephox/agar';
import { describe, it } from '@ephox/bedrock-client';
import { Arr } from '@ephox/katamari';
import { TinyAssertions, TinyHooks, TinySelections } from '@ephox/wrap-mcagar';

import Editor from 'tinymce/core/api/Editor';
import Plugin from 'tinymce/plugins/lists/Plugin';

describe('webdriver.tinymce.plugins.lists.ContentEditableFalseTest', () => {
  const hook = TinyHooks.bddSetupLight<Editor>({
    plugins: 'lists',
    toolbar: 'numlist bullist',
    base_url: '/project/tinymce/js/tinymce'
  }, [ Plugin ], true);

  const selector = 'iframe => body';

  interface ListParameters {
    readonly title: string,
    readonly content: string;
    readonly startPath: number[];
    readonly endPath: number[];
  }

  interface ListAction {
    readonly title: string;
    readonly modifiers: { shift?: boolean };
    readonly key: string;
    readonly offset: number;
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
    startPath: [ 1, 1, 0 ],
    endPath: [ 0, 1, 0 ]
  }]);

  const divNestedNonEditableList: ListParameters[] = Arr.bind(listTypes, (type: string) => [{
    title: 'non-editable div nested ' + type + ' list',
    content: divNestedNonEditableListContents(type),
    startPath: [ 0, 2, 0 ],
    endPath: [ 0, 1, 0 ]
  }]);

  const nestedNonEditableList: ListParameters[] = Arr.bind(listTypes, (type1: string) =>
    Arr.bind(listTypes, (type2: string) => [{
      title: 'non-editable ' + type2 + ' list within editable ' + type1 + 'list',
      content: nestedNonEditableListContents(type1, type2),
      startPath: [ 1, 1, 0 ],
      endPath: [ 0, 1, 0 ]
  }]));

  const contentCombinations = Arr.flatten([
    nonEditableList,
    divNestedNonEditableList,
    nestedNonEditableList
  ]);

  const listActions: ListAction[] = [
    // TODO include 'enter' key here
    {title: 'delete', modifiers: {}, key: 'delete', offset: 0},
    {title: 'tab', modifiers: {}, key: 'tab', offset: 1},
    {title: 'shift-tab', modifiers: { shift: true }, key: 'tab', offset: -1},
  ];

  listActions.forEach((listAction: ListAction) =>
    contentCombinations.forEach((list: ListParameters) =>
      it('TINY-8920: Pressing ' + listAction.title + ' key is disabled when in ' + list.title, async () => {
        // Update end cursor position from pressing tab
        list.endPath[1] += listAction.offset;
        const editor = hook.editor();
        editor.setContent(list.content);
        TinySelections.setCursor(editor, list.startPath, 0);
        await RealKeys.pSendKeysOn(selector, [ RealKeys.combo(listAction.modifiers, listAction.key) ]);
        TinyAssertions.assertCursor(editor, list.endPath, 0);
        TinyAssertions.assertContent(editor, list.content);
      })
    )
  );
});
