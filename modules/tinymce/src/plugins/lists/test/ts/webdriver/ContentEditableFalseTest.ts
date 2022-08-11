import { RealKeys } from '@ephox/agar';
import { describe, it } from '@ephox/bedrock-client';
import { TinyAssertions, TinyHooks, TinySelections } from '@ephox/wrap-mcagar';

import Editor from 'tinymce/core/api/Editor';
import Plugin from 'tinymce/plugins/lists/Plugin';

describe('webdriver.tinymce.plugins.lists.ContentEditableFalseTest', () => {
  const hook = TinyHooks.bddSetupLight<Editor>({
    plugins: 'lists',
    toolbar: 'numlist bullist',
    base_url: '/project/tinymce/js/tinymce'
  }, [ Plugin ], true);

  const listSelector = 'iframe => body => li';

  const noneditableLiContent = '<ol contenteditable="false">\n' +
    '<li contenteditable="true">editable</li>\n' +
    '<li>noneditable</li>\n' +
    '<li contenteditable="true">editable</li>\n' +
  '</ol>';

  const nestedEditableLiContent = '<ol contenteditable="false">\n' +
    '<li contenteditable="true">one</li>\n' +
    '<li>nested\n' +
    '<ul>\n' +
      '<li contenteditable="true">two</li>\n' +
      '<li contenteditable="true">three</li>\n' +
      '<li contenteditable="true">four</li>\n' +
    '</ul>\n' +
    '</li>\n' +
    '<li>three</li>\n' +
    '<li>four</li>\n' +
  '</ol>';

  interface TempArguments {
    modifiers: { shift?: boolean };
    key: string;
    selector: string;
    content: string;
    startPath: number[];
    endPath: number[];
  }

  const pPressKeyAtElementOnContentWithoutChange = async (args: TempArguments) => {
    const editor = hook.editor();
    editor.setContent(args.content);
    TinySelections.setCursor(editor, args.startPath, 0);
    await RealKeys.pSendKeysOn(args.selector, [ RealKeys.combo(args.modifiers, args.key) ]);
    TinyAssertions.assertCursor(editor, args.endPath, 0);
    TinyAssertions.assertContent(editor, args.content);
  };

  it('TINY-8920: backspace from beginning editable first LI in noneditable OL with no change', () => {
    pPressKeyAtElementOnContentWithoutChange({
      modifiers: {},
      key: 'backspace',
      selector: listSelector,
      content: noneditableLiContent,
      startPath: [ 1, 0, 0 ],
      endPath: [ 0, 0, 0 ]
    });
  });

  it('TINY-8920: backspace from beginning second editable LI in noneditable OL with no change', () => {
    pPressKeyAtElementOnContentWithoutChange({
      modifiers: {},
      key: 'backspace',
      selector: listSelector,
      content: noneditableLiContent,
      startPath: [ 1, 1, 0 ],
      endPath: [ 0, 1, 0 ]
    });
  });

  it('TINY-8920: backspace from beginning editable first LI in nested noneditable UL with no change', () => {
    pPressKeyAtElementOnContentWithoutChange({
      modifiers: {},
      key: 'backspace',
      selector: listSelector,
      content: nestedEditableLiContent,
      startPath: [ 1, 2, 0 ],
      endPath: [ 0, 2, 0 ]
    });
  });

  it('TINY-8920: enter from beginning editable first LI in noneditable OL with no change', () => {
    pPressKeyAtElementOnContentWithoutChange({
      modifiers: {},
      key: 'enter',
      selector: listSelector,
      content: noneditableLiContent,
      startPath: [ 1, 0, 0 ],
      endPath: [ 0, 0, 0 ]
    });
  });

  it('TINY-8920: enter from beginning second editable LI in noneditable OL with no change', () => {
    pPressKeyAtElementOnContentWithoutChange({
      modifiers: {},
      key: 'enter',
      selector: listSelector,
      content: noneditableLiContent,
      startPath: [ 1, 1, 0 ],
      endPath: [ 0, 1, 0 ]
    });
  });

  it('TINY-8920: enter from beginning editable first LI in nested noneditable UL with no change', () => {
    pPressKeyAtElementOnContentWithoutChange({
      modifiers: {},
      key: 'enter',
      selector: listSelector,
      content: nestedEditableLiContent,
      startPath: [ 1, 2, 0 ],
      endPath: [ 0, 2, 0 ]
    });
  });

  it('TINY-8920: tab from beginning editable first LI in noneditable OL with no change', () => {
    pPressKeyAtElementOnContentWithoutChange({
      modifiers: {},
      key: 'tab',
      selector: listSelector,
      content: noneditableLiContent,
      startPath: [ 1, 0, 0 ],
      endPath: [ 0, 2, 0 ]
    });
  });

  it('TINY-8920: shift-tab from beginning second editable LI in noneditable OL with no change', () => {
    pPressKeyAtElementOnContentWithoutChange({
      modifiers: { shift: true },
      key: 'tab',
      selector: listSelector,
      content: noneditableLiContent,
      startPath: [ 1, 1, 0 ],
      endPath: [ 0, 0, 0 ]
    });
  });

  it('TINY-8920: tab from beginning editable first LI in nested noneditable UL with no change', () => {
    pPressKeyAtElementOnContentWithoutChange({
      modifiers: {},
      key: 'tab',
      selector: listSelector,
      content: nestedEditableLiContent,
      startPath: [ 1, 2, 0 ],
      endPath: [ 0, 3, 0 ]
    });
  });

  it('TINY-8920: shift-tab from beginning editable second LI in nested noneditable UL with no change', () => {
    pPressKeyAtElementOnContentWithoutChange({
      modifiers: { shift: true },
      key: 'tab',
      selector: listSelector,
      content: nestedEditableLiContent,
      startPath: [ 1, 2, 0 ],
      endPath: [ 0, 1, 0 ]
    });
  });
});
