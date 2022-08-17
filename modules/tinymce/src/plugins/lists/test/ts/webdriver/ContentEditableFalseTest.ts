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

interface ListAction {
  readonly title: string;
  readonly keyPress: any[];
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

  const nonEditableList: ListParameters[] = Arr.bind(listTypes, (type: string) => [{
    title: `non-editable ${type} list`,
    content: nonEditableListContents(type),
    startPath: [ 1, 0, 0 ],
    selector: `iframe => body ${type} li`
  }]);

  const divNestedNonEditableList: ListParameters[] = Arr.bind(listTypes, (type: string) => [{
    title: `non-editable div nested ${type} list`,
    content: divNestedNonEditableListContents(type),
    startPath: [ 0, 1, 0 ],
    selector: `iframe => body ${type} li`
  }]);

  const nestedNonEditableList: ListParameters[] = Arr.bind(listTypes, (type1: string) =>
    Arr.bind(listTypes, (type2: string) => [{
      title: `non-editable ${type2} list within editable ${type1} list`,
      content: nestedNonEditableListContents(type1, type2),
      startPath: [ 1, 0, 0, 1, 0, 0 ],
      selector: `iframe => body ${type1} li ${type2} li`
    }])
  );

  const contentCombinations: ListParameters[] = Arr.flatten([
    nonEditableList,
    divNestedNonEditableList,
    nestedNonEditableList
  ]);

  const listActions: ListAction[] = [
    { title: 'backspace key', keyPress: [ RealKeys.backspace() ] },
    { title: 'enter key', keyPress: [ RealKeys.combo({}, 'enter') ] },
    { title: 'tab key', keyPress: [ RealKeys.combo({}, 'tab') ] },
    { title: 'shift and tab keys', keyPress: [ RealKeys.combo({ shift: true }, 'tab') ] },
  ];

  Arr.each(listActions, (listAction) =>
    context(listAction.title, () =>
      Arr.each(contentCombinations, (list) =>
        it(`TINY-8920: Pressing ${listAction.title} is disabled when in ${list.title}`, async () => {
          const editor = hook.editor();
          editor.setContent(list.content);
          TinySelections.setCursor(editor, list.startPath, 0);
          await RealKeys.pSendKeysOn(list.selector, listAction.keyPress);
          TinyAssertions.assertContent(editor, list.content);
        })
      )
    )
  );
});
