import { context, describe, it } from '@ephox/bedrock-client';
import { Arr } from '@ephox/katamari';
import { TinyAssertions, TinyHooks, TinySelections, TinyUiActions } from '@ephox/wrap-mcagar';

import Editor from 'tinymce/core/api/Editor';
import AdvListPlugin from 'tinymce/plugins/advlist/Plugin';
import ListsPlugin from 'tinymce/plugins/lists/Plugin';

interface ListStyle {
  readonly type: string;
  readonly style: string;
}

interface ListParameters {
  readonly name: string;
  readonly content: string;
  readonly startPath: number[];
}

interface ListAction {
  readonly title: string;
  readonly action: (editor: Editor) => any;
}

describe('browser.tinymce.plugins.lists.ContentEditableFalseActionsTest', () => {
  const hook = TinyHooks.bddSetupLight<Editor>({
    plugins: 'advlist lists',
    advlist_bullet_styles: 'default,lower-alpha,lower-greek,lower-roman,upper-alpha,upper-roman',
    advlist_number_styles: 'default,circle,square',
    toolbar: 'numlist bullist',
    base_url: '/project/tinymce/js/tinymce'
  }, [ AdvListPlugin, ListsPlugin ], true);

  const styleAttr = ' style="list-style-type: ';
  const cefAttr = ';" contenteditable="false">\n';

  const orderedListStyles = [ 'lower-alpha', 'lower-greek', 'lower-roman', 'upper-alpha', 'upper-roman' ];
  const numberedListStyles = [ 'circle', 'square' ];

  const OlListTypes: ListStyle[] = Arr.bind(orderedListStyles, (style) => [{ type: 'ol', style }]);
  const UlListTypes: ListStyle[] = Arr.bind(numberedListStyles, (style) => [{ type: 'ul', style }]);
  const listTypes = Arr.flatten([ OlListTypes, UlListTypes ]);

  const listContent =
    '<li contenteditable="true">editable</li>\n' +
    '<li>noneditable</li>\n' +
    '<li contenteditable="true">editable</li>\n' +
    '<li>noneditable</li>\n' +
    '<li contenteditable="true">editable</li>\n';

  const nonEditableListContents = (list: ListStyle): string =>
    '<' + list.type + styleAttr + list.style + cefAttr +
      listContent +
    '</' + list.type + '>';

  const divNestedNonEditableListContents = (list: ListStyle): string =>
    '<div contenteditable="true">\n' +
      '<' + list.type + styleAttr + list.style + cefAttr +
        listContent +
      '</' + list.type + '>\n' +
    '</div>';

  const nonEditableList: ListParameters[] = Arr.bind(listTypes, (list) => [{
    name: 'non-editable ' + list.type + ' ' + list.style + ' list',
    content: nonEditableListContents(list),
    startPath: [ 0, 0 ]
  }]);

  const divNestedNonEditableList: ListParameters[] = Arr.bind(listTypes, (list) => [{
    name: 'non-editable div nested ' + list.type + ' ' + list.style + ' list',
    content: divNestedNonEditableListContents(list),
    startPath: [ 0, 0, 0 ]
  }]);

  const contentCombinations: ListParameters[] = Arr.flatten([
    nonEditableList,
    divNestedNonEditableList
  ]);

  const randomIndex = (min: number, max: number) => Math.round(Math.random() * (max - min) + min);
  const randomContents = (acc: ListParameters[], contents: ListParameters[], num: number): ListParameters[] =>
    num > 0 ? randomContents([ ...acc, contents[randomIndex(0, contents.length)] ], contents, num - 1) : acc;

  const numContents = 10; // Number of content combinations to be tested
  const randomContentCombinations = randomContents([], contentCombinations, numContents);

  const listActions: ListAction[] = [
    { title: 'Numbered list toolbar button', action: (editor: Editor) => TinyUiActions.clickOnToolbar(editor, '[aria-label="Numbered list"] > .tox-tbtn') },
    { title: 'Bullet list toolbar button', action: (editor: Editor) => TinyUiActions.clickOnToolbar(editor, '[aria-label="Bullet list"] > .tox-tbtn') }
  ];

  Arr.each(listActions, (listAction) =>
    context(listAction.title, () =>
      Arr.each(randomContentCombinations, (list) =>
        it('TINY-8920: ' + listAction.title + ' is disabled when in ' + list.name, () => {
          const editor = hook.editor();
          editor.setContent(list.content);
          TinySelections.setCursor(editor, list.startPath, 0);
          listAction.action(editor);
          TinyAssertions.assertCursor(editor, list.startPath, 0);
          TinyAssertions.assertContent(editor, list.content);
        })
      )
    )
  );
});
