import { describe, it } from '@ephox/bedrock-client';
import { Arr } from '@ephox/katamari';
import { TinyAssertions, TinyHooks, TinySelections, TinyUiActions } from '@ephox/wrap-mcagar';

import Editor from 'tinymce/core/api/Editor';
import AdvListPlugin from 'tinymce/plugins/advlist/Plugin';
import ListsPlugin from 'tinymce/plugins/lists/Plugin';

interface ListStyle {
  readonly type: string;
  readonly style: string;
}

interface ListContents {
  readonly listName: string;
  readonly content: string;
  readonly startPath: number[];
}

interface ListAction {
  readonly title: string;
  readonly action: (editor: Editor) => any;
}

describe('browser.tinymce.plugins.advlist.ContentEditableFalseTest', () => {
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

  const listContent = `<li contenteditable="true">editable</li>
<li>noneditable</li>
<li contenteditable="true">editable</li>
<li>noneditable</li>
<li contenteditable="true">editable</li>`;

  const nonEditableListContents = (list: ListStyle): string =>
    `<${list.type}${styleAttr}${list.style}${cefAttr}${listContent}
</${list.type}>`;

  const divNestedNonEditableListContents = (list: ListStyle): string =>
    `<div contenteditable="true">
<${list.type}${styleAttr}${list.style}${cefAttr}${listContent}
</${list.type}>
</div>`;

  const nonEditableList: ListContents[] = Arr.bind(listTypes, (list) => [{
    listName: `non-editable ${list.type} ${list.style} list`,
    content: nonEditableListContents(list),
    startPath: [ 1, 0 ]
  }]);

  const divNestedNonEditableList: ListContents[] = Arr.bind(listTypes, (list) => [{
    listName: `non-editable div nested ${list.type} ${list.style} list`,
    content: divNestedNonEditableListContents(list),
    startPath: [ 0, 0, 0 ]
  }]);

  const contentCombinations: ListContents[] = Arr.flatten([
    nonEditableList,
    divNestedNonEditableList
  ]);

  const listActions: ListAction[] = [
    { title: 'Numbered list toolbar button', action: (editor: Editor) => TinyUiActions.clickOnToolbar(editor, '[aria-label="Numbered list"] > .tox-tbtn') },
    { title: 'Bullet list toolbar button', action: (editor: Editor) => TinyUiActions.clickOnToolbar(editor, '[aria-label="Bullet list"] > .tox-tbtn') }
  ];

  Arr.each(contentCombinations, (listContent) =>
    Arr.each(listActions, (listAction) =>
      it(`TINY-8920: Pressing ${listAction.title} is disabled when in ${listContent.listName}`, () => {
        const editor = hook.editor();
        editor.setContent(listContent.content);
        TinySelections.setCursor(editor, listContent.startPath, 0);
        listAction.action(editor);
        TinyUiActions.pWaitForUi(editor, 'button[aria-label="${selector}"][aria-pressed="true"][aria-disabled="true"]');
        TinyAssertions.assertContent(editor, listContent.content);
      })
    )
  );
});
