import { RealKeys } from '@ephox/agar';
import { context, describe, it } from '@ephox/bedrock-client';
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

  interface ListParameters {
    readonly title: string;
    readonly content: string;
    readonly startPath: number[];
    readonly selector: string;
  }

  interface ListAction {
    readonly title: string;
    readonly keyPress: any[];
  }

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
    startPath: [ 1, 0, 0 ],
    selector: 'iframe => body ' + type + ' li'
  }]);

  const divNestedNonEditableList: ListParameters[] = Arr.bind(listTypes, (type: string) => [{
    title: 'non-editable div nested ' + type + ' list',
    content: divNestedNonEditableListContents(type),
    startPath: [ 0, 1, 0 ],
    selector: 'iframe => body ' + type + ' li'
  }]);

  const nestedNonEditableList: ListParameters[] = Arr.bind(listTypes, (type1: string) =>
    Arr.bind(listTypes, (type2: string) => [{
      title: 'non-editable ' + type2 + ' list within editable ' + type1 + 'list',
      content: nestedNonEditableListContents(type1, type2),
      startPath: [ 1, 0, 0, 1, 0, 0 ],
      selector: 'iframe => body ' + type1 + ' li ' + type2 + ' li'
  }]));

  const contentCombinations: ListParameters[] = Arr.flatten([
    nonEditableList,
    divNestedNonEditableList,
    nestedNonEditableList
  ]);

  const listActions: ListAction[] = [
    // TODO include 'enter' key here
    {title: 'backspace key', keyPress: [ RealKeys.backspace() ]},
    {title: 'tab key', keyPress: [ RealKeys.combo({}, 'tab') ]},
    {title: 'shift and tab keys', keyPress: [ RealKeys.combo({ shift: true }, 'tab') ]},
  ];

  Arr.each(listActions, (listAction: ListAction) => context(listAction.title, () =>
    Arr.each(contentCombinations, (list: ListParameters) =>
      it('TINY-8920: Pressing ' + listAction.title + ' is disabled when in ' + list.title, async () => {
        const editor = hook.editor();
        editor.setContent(list.content);
        TinySelections.setCursor(editor, list.startPath, 0);
        await RealKeys.pSendKeysOn(list.selector, listAction.keyPress);
        TinyAssertions.assertContent(editor, list.content);
      })
    )
  ));
});
