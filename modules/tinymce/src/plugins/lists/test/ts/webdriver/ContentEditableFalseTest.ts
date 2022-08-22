import { RealKeys } from '@ephox/agar';
import { context, describe, it } from '@ephox/bedrock-client';
import { Arr } from '@ephox/katamari';
import { TinyAssertions, TinyHooks, TinySelections } from '@ephox/wrap-mcagar';

import Editor from 'tinymce/core/api/Editor';
import Plugin from 'tinymce/plugins/lists/Plugin';

interface ListParameters {
  readonly title: string;
  readonly content: string;
  readonly startPath: number[];
  readonly selector: string;
}

describe('webdriver.tinymce.plugins.lists.ContentEditableFalseTest', () => {
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

  const nonEditableList: ListParameters[] = Arr.map(listTypes, (type: string) => ({
    title: `non-editable ${type} list`,
    content: nonEditableListContents(type),
    startPath: [ 1, 0, 0 ],
    selector: `iframe => body ${type} li`
  }));

  const divNestedNonEditableList: ListParameters[] = Arr.map(listTypes, (type: string) => ({
    title: `non-editable div nested ${type} list`,
    content: divNestedNonEditableListContents(type),
    startPath: [ 0, 1, 0 ],
    selector: `iframe => body ${type} li`
  }));

  const nestedNonEditableList: ListParameters[] = Arr.bind(listTypes, (type1: string) =>
    Arr.map(listTypes, (type2: string) => ({
      title: `non-editable ${type2} list within editable ${type1} list`,
      content: nestedNonEditableListContents(type1, type2),
      startPath: [ 1, 0, 0, 1, 0, 0 ],
      selector: `iframe => body ${type1} li ${type2} li`
    }))
  );

  const contentCombinations: ListParameters[] = [
    ...nonEditableList,
    ...divNestedNonEditableList,
    ...nestedNonEditableList
  ];

  const pressKeyInListAndAssertNoChange = async (list: ListParameters, keyPress: any[]) => {
    const editor = hook.editor();
    editor.setContent(list.content);
    TinySelections.setCursor(editor, list.startPath, 0);
    await RealKeys.pSendKeysOn(list.selector, keyPress);
    TinyAssertions.assertContent(editor, list.content);
  };

  Arr.each(contentCombinations, (list) =>
    context(list.title, () => {
      it(`TINY-8920: Pressing backspace key to append to previous list item is disabled when in ${list.title}`, () =>
        pressKeyInListAndAssertNoChange(list, [ RealKeys.backspace() ])
      );

      it(`TINY-8920: Pressing enter key to split into new list item is disabled when in ${list.title}`, () =>
        pressKeyInListAndAssertNoChange(list, [ RealKeys.combo({}, 'enter') ])
      );

      it(`TINY-8920: Pressing tab key to indent list item is disabled when in ${list.title}`, () =>
        pressKeyInListAndAssertNoChange(list, [ RealKeys.combo({}, 'tab') ])
      );

      it(`TINY-8920: Pressing shift and tab keys to outdent list item is disabled when in ${list.title}`, () =>
        pressKeyInListAndAssertNoChange(list, [ RealKeys.combo({ shift: true }, 'tab') ])
      );
    })
  );
});
