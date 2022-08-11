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
    modifiers: { shift?: boolean },
    key: string,
    selector: string,
    content: string,
    startPath: number[],
    endPath: number[]
  };

  const pPressKeyAtElementOnContentWithoutChange = async (args: TempArguments) => {
    const editor = hook.editor();
    editor.setContent(args.content);
    TinySelections.setCursor(editor, args.startPath, 0); // HTML is fake-caret
    await RealKeys.pSendKeysOn(args.selector, [ RealKeys.combo(args.modifiers, args.key) ]);
    TinyAssertions.assertCursor(editor, args.endPath, 0);
    TinyAssertions.assertContent(editor, args.content);
  };

  it('TINY-8920: backspace from beginning editable first LI in noneditable OL with no change', async () => {
    pPressKeyAtElementOnContentWithoutChange({
      modifiers: {},
      key: 'backspace',
      selector: 'iframe => body li:first-child',
      content: noneditableLiContent,
      startPath: [ 1, 0, 0 ],
      endPath: [ 0, 0, 0]
    });
  });

  it('TINY-8920: backspace from beginning second editable LI in noneditable OL with no change', async () => {
    pPressKeyAtElementOnContentWithoutChange({
      modifiers: {},
      key: 'backspace',
      selector: 'iframe => body li:last-child',
      content: noneditableLiContent,
      startPath: [ 1, 2, 0 ],
      endPath: [ 0, 2, 0]
    });
  });

  it('TINY-8920: backspace from beginning editable first LI in nested noneditable UL with no change', async () => {
    pPressKeyAtElementOnContentWithoutChange({
      modifiers: {},
      key: 'backspace',
      selector: 'iframe => body li:second-child',
      content: nestedEditableLiContent,
      startPath: [ 1, 1, 1, 0 ],
      endPath: [ 0, 1, 1, 0]
    });
  });

  it('TINY-8920: enter from beginning editable first LI in noneditable OL with no change', async () => {
    pPressKeyAtElementOnContentWithoutChange({
      modifiers: {},
      key: 'enter',
      selector: 'iframe => body li:first-child',
      content: noneditableLiContent,
      startPath: [ 1, 0, 0 ],
      endPath: [ 0, 0, 0]
    });
  });

  it('TINY-8920: enter from beginning second editable LI in noneditable OL with no change', async () => {
    pPressKeyAtElementOnContentWithoutChange({
      modifiers: {},
      key: 'enter',
      selector: 'iframe => body li:last-child',
      content: noneditableLiContent,
      startPath: [ 1, 2, 0 ],
      endPath: [ 0, 2, 0]
    });
  });

  it('TINY-8920: enter from beginning editable first LI in nested noneditable UL with no change', async () => {
    pPressKeyAtElementOnContentWithoutChange({
      modifiers: {},
      key: 'enter',
      selector: 'iframe => body li:second-child',
      content: nestedEditableLiContent,
      startPath: [ 1, 1, 1, 0 ],
      endPath: [ 0, 1, 1, 0]
    });
  });

  it('TINY-8920: tab from beginning editable first LI in noneditable OL with no change', async () => {
    pPressKeyAtElementOnContentWithoutChange({
      modifiers: {},
      key: 'tab',
      selector: 'iframe => body li:first-child',
      content: noneditableLiContent,
      startPath: [ 1, 0, 0 ],
      endPath: [ 0, 2, 0]
    });
  });

  it('TINY-8920: shift-tab from beginning second editable LI in noneditable OL with no change', async () => {
    pPressKeyAtElementOnContentWithoutChange({
      modifiers: { shift: true },
      key: 'tab',
      selector: 'iframe => body li:last-child',
      content: noneditableLiContent,
      startPath: [ 1, 2, 0 ],
      endPath: [ 0, 0, 0]
    });
  });

  it('TINY-8920: tab from beginning editable first LI in nested noneditable UL with no change', async () => {
    pPressKeyAtElementOnContentWithoutChange({
      modifiers: {},
      key: 'tab',
      selector: 'iframe => body li:second-child',
      content: nestedEditableLiContent,
      startPath: [ 1, 1, 1, 0 ],
      endPath: [ 0, 1, 2, 0]
    });
  });

  it('TINY-8920: shift-tab from beginning editable second LI in nested noneditable UL with no change', async () => {
    pPressKeyAtElementOnContentWithoutChange({
      modifiers: { shift: true },
      key: 'tab',
      selector: 'iframe => body li:third-child',
      content: nestedEditableLiContent,
      startPath: [ 1, 1, 2, 0 ],
      endPath: [ 0, 1, 1, 0]
    });
  });
});
