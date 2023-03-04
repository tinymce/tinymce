import { Keys, UiFinder } from '@ephox/agar';
import { context, describe, it } from '@ephox/bedrock-client';
import { Arr } from '@ephox/katamari';
import { Class, Insert, Remove, SelectorFind, Selectors, SugarBody, SugarElement, Traverse } from '@ephox/sugar';
import { TinyHooks, TinyUiActions } from '@ephox/wrap-mcagar';
import { assert } from 'chai';

import Editor from 'tinymce/core/api/Editor';

describe('browser.tinymce.themes.silver.editor.SilverUiModeTest', () => {
  const sharedSettings = {
    menubar: 'file',
    toolbar: 'undo bold',
    base_url: '/project/tinymce/js/tinymce'
  };

  const selectors = {
    sink: '.tox-silver-sink',
    fileMenu: '[role=menuitem]:contains("File")',
    menu: '[role=menu]',
    dialog: '[role=dialog]',
    editorParent: 'div.test-editor-parent'
  };

  // These tests are going to create editor inside another divs, so that we can
  // test whether the sinks are being put in the correct place.
  const setupElement = (inline: boolean) => {

    const grandparent = SugarElement.fromTag('div');
    Class.add(grandparent, 'test-editor-grandparent');
    const parent = SugarElement.fromTag('div');
    Class.add(parent, 'test-editor-parent');
    const target = inline ? SugarElement.fromTag('div') : SugarElement.fromTag('textarea');

    Insert.append(parent, target);
    Insert.append(grandparent, parent);

    // The Loader is going to try to insert `target` into the body if it isn't already in the body,
    // so we insert grandparent here.
    Insert.append(SugarBody.body(), grandparent);

    // We remove the outer most div, not just the target element
    const teardown = () => {
      Remove.remove(grandparent);
    };

    return {
      element: target,
      teardown
    };
  };

  const assertIsDialogSinkInBody = (sink: SugarElement<Element>): void => {
    assert.isTrue(Class.has(sink, 'tox-silver-sink'), 'Sink should have sink class');
    assert.isFalse(Class.has(sink, 'tox-silver-popup-sink'), 'Sink should not have popup sink class');
    assertParentIs(sink, 'body');
  };

  const assertIsPopupSinkIn = (sink: SugarElement<Element>, selector: string): void => {
    assert.isTrue(Class.has(sink, 'tox-silver-sink'), 'Sink should have sink class');
    assert.isTrue(Class.has(sink, 'tox-silver-popup-sink'), 'Sink should have popup sink class');
    assertParentIs(sink, selector);
  };

  // Just finished writing this and using it in the test.
  const assertParentIs = (element: SugarElement<Element>, selector: string): void => {
    const parent = Traverse.parent(element).getOrDie(
      `Could not find the parent when testing if parent matched selector: "${selector}"`
    );
    assert.isTrue(
      Selectors.is(parent, selector),
      `Parent of element did not match selector: "${selector}"`
    );
  };

  const pAssertOneSinkMode = async (editor: Editor): Promise<void> => {
    // For inline mode, we need to focus the editor to get the sink
    editor.focus();
    await TinyUiActions.pWaitForUi(editor, selectors.sink);
    const uiRoot = TinyUiActions.getUiRoot(editor);
    const sinks = UiFinder.findAllIn(uiRoot, selectors.sink);
    assert.equal(1, sinks.length, 'There should be one sink in ui_mode: combined mode');
    assertIsDialogSinkInBody(sinks[0]);
  };

  const pAssertTwoSinksMode = async (editor: Editor): Promise<void> => {
    // For inline mode, we need to focus the editor to get the sink
    editor.focus();
    await TinyUiActions.pWaitForUi(editor, selectors.sink);
    const uiRoot = TinyUiActions.getUiRoot(editor);
    const sinks = UiFinder.findAllIn(uiRoot, selectors.sink);
    assert.equal(2, sinks.length, 'There should be two sinks in ui_mode: split mode');
    // TODO: Double-check this ordering.
    assertIsDialogSinkInBody(sinks[1]);
    assertIsPopupSinkIn(sinks[0], selectors.editorParent);
  };

  const pGetSinkWithPopup = async (editor: Editor): Promise<SugarElement<Element>> => {
    await TinyUiActions.pWaitForUi(editor, selectors.fileMenu);
    TinyUiActions.clickOnMenu(editor, selectors.fileMenu);
    const menu = await TinyUiActions.pWaitForPopup(editor, selectors.menu);
    return SelectorFind.ancestor(menu, selectors.sink).getOrDie(
      'Could not find containing sink of menu'
    );
  };

  const pGetSinkWithDialog = async (editor: Editor): Promise<SugarElement<Element>> => {
    editor.windowManager.open({
      title: 'Test Dialog',
      body: {
        type: 'panel',
        items: [
          {
            name: 'alpha',
            type: 'input'
          }
        ]
      },
      buttons: [ ]
    });
    const dialog = await TinyUiActions.pWaitForDialog(editor);
    return SelectorFind.ancestor(dialog, selectors.sink).getOrDie(
      'Could not find containing sink of dialog'
    );
  };

  const closeMenu = (editor: Editor): void => {
    const uiRoot = TinyUiActions.getUiRoot(editor);
    TinyUiActions.keystroke(editor, Keys.escape());
    UiFinder.notExists(uiRoot, selectors.menu);
  };

  const closeDialog = (editor: Editor): void => {
    const uiRoot = TinyUiActions.getUiRoot(editor);
    TinyUiActions.keystroke(editor, Keys.escape());
    UiFinder.notExists(uiRoot, selectors.dialog);
  };

  context('ui_mode: combined', () => {
    Arr.each([
      { name: 'inline', settings: { inline: true }},
      { name: 'normal', settings: { inline: false }}
    ], (tester) => {
      context(tester.name, () => {
        const hook = TinyHooks.bddSetupFromElement<Editor>(
          {
            ...tester.settings,
            ui_mode: 'combined',
            ...sharedSettings,
          },
          () => setupElement(tester.settings.inline),
          []
        );

        it('TINY-9226: Check basic structure (1 sink, parent is body)', async () => {
          const editor = hook.editor();
          await pAssertOneSinkMode(editor);
        });

        it('TINY-9226: Check popup menu sink location - dialog sink (there is no popup sink)', async () => {
          const editor = hook.editor();
          editor.focus();
          const sink = await pGetSinkWithPopup(editor);
          assertIsDialogSinkInBody(sink);
          closeMenu(editor);
        });

        it('TINY-9226: Check dialog sink location - dialog sink', async () => {
          const editor = hook.editor();
          editor.focus();
          const sink = await pGetSinkWithDialog(editor);
          assertIsDialogSinkInBody(sink);
          closeDialog(editor);
        });
      });
    });
  });

  context('ui_mode: split', () => {
    Arr.each([
      { name: 'inline', settings: { inline: true }},
      { name: 'normal', settings: { inline: false }}
    ], (tester) => {
      context(tester.name, () => {
        const hook = TinyHooks.bddSetupFromElement<Editor>(
          {
            ...tester.settings,
            ui_mode: 'split',
            ...sharedSettings
          },
          () => setupElement(tester.settings.inline),
          []
        );

        it('TINY-9226: Check basic structure', async () => {
          const editor = hook.editor();
          await pAssertTwoSinksMode(editor);
        });

        it('TINY-9226: Check popup menu sink location', async () => {
          const editor = hook.editor();
          editor.focus();
          const sink = await pGetSinkWithPopup(editor);
          assertIsPopupSinkIn(sink, selectors.editorParent);
          closeMenu(editor);
        });

        it('TINY-9226: Check dialog sink location', async () => {
          const editor = hook.editor();
          editor.focus();
          const sink = await pGetSinkWithDialog(editor);
          assertIsDialogSinkInBody(sink);
          closeDialog(editor);
        });
      });
    });
  });
});
