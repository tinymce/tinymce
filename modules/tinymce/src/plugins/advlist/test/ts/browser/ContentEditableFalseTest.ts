import { UiFinder } from '@ephox/agar';
import { context, describe, it } from '@ephox/bedrock-client';
import { Arr } from '@ephox/katamari';
import { SugarBody } from '@ephox/sugar';
import { TinyAssertions, TinyHooks, TinySelections, TinyUiActions } from '@ephox/wrap-mcagar';

import Editor from 'tinymce/core/api/Editor';
import AdvListPlugin from 'tinymce/plugins/advlist/Plugin';
import ListsPlugin from 'tinymce/plugins/lists/Plugin';

interface ListStyle {
  readonly type: string;
  readonly style: string;
}

interface ListParameters {
  readonly title: string;
  readonly content: string;
  readonly startPath: number[];
}

describe('browser.tinymce.plugins.advlist.ContentEditableFalseTest', () => {
  const hook = TinyHooks.bddSetupLight<Editor>({
    plugins: 'advlist lists',
    advlist_bullet_styles: 'default,lower-alpha,lower-greek,lower-roman,upper-alpha,upper-roman',
    advlist_number_styles: 'default,circle,square',
    toolbar: 'numlist bullist',
    base_url: '/project/tinymce/js/tinymce'
  }, [ AdvListPlugin, ListsPlugin ], true);

  const orderedListStyles = [ 'lower-alpha', 'lower-greek', 'lower-roman', 'upper-alpha', 'upper-roman' ];
  const numberedListStyles = [ 'circle', 'square' ];

  const olListTypes: ListStyle[] = Arr.map(orderedListStyles, (style) => ({ type: 'ol', style }));
  const ulListTypes: ListStyle[] = Arr.map(numberedListStyles, (style) => ({ type: 'ul', style }));
  const listTypes = [ ...olListTypes, ...ulListTypes ];

  const listContent = `<li contenteditable="true">editable</li>
<li>noneditable</li>
<li contenteditable="true">editable</li>
<li>noneditable</li>
<li contenteditable="true">editable</li>`;

  const nonEditableListContents = (list: ListStyle): string =>
    `<${list.type} style="list-style-type: ${list.style};" contenteditable="false">
${listContent}
</${list.type}>`;

  const divNestedNonEditableListContents = (list: ListStyle): string =>
    `<div contenteditable="true">
<${list.type} style="list-style-type: ${list.style};" contenteditable="false">
${listContent}
</${list.type}>
</div>`;

  const nonEditableList: ListParameters[] = Arr.map(listTypes, (list) => ({
    title: `non-editable ${list.type} ${list.style} list`,
    content: nonEditableListContents(list),
    startPath: [ 1, 0 ]
  }));

  const divNestedNonEditableList: ListParameters[] = Arr.map(listTypes, (list) => ({
    title: `non-editable div nested ${list.type} ${list.style} list`,
    content: divNestedNonEditableListContents(list),
    startPath: [ 0, 1, 0 ]
  }));

  const contentCombinations: ListParameters[] = [
    ...nonEditableList,
    ...divNestedNonEditableList
  ];

  const checkToolbarDisabled = (editor: Editor, listType: string) => {
    UiFinder.exists(SugarBody.body(), `[aria-label="${listType}"][aria-disabled="true"] > .tox-tbtn`);
    TinyUiActions.clickOnToolbar(editor, `[aria-label="${listType}"][aria-disabled="true"] > .tox-tbtn`);
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
    })
  );
});
