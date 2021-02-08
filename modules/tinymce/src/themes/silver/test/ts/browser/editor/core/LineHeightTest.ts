import { UiFinder } from '@ephox/agar';
import { context, describe, it } from '@ephox/bedrock-client';
import { Arr, Optional } from '@ephox/katamari';
import { TinyAssertions, TinyHooks, TinySelections, TinyUiActions } from '@ephox/mcagar';
import { Attribute } from '@ephox/sugar';
import { assert } from 'chai';

import Editor from 'tinymce/core/api/Editor';
import Theme from 'tinymce/themes/silver/Theme';

describe('browser.tinymce.themes.silver.editor.core.LineHeightTest', () => {
  const settings = {
    base_url: '/project/tinymce/js/tinymce',
    toolbar: 'lineheight'
  };

  const pOpenToolbar = async (editor: Editor) => {
    TinyUiActions.clickOnToolbar(editor, '[title="Line height"]');
    await TinyUiActions.pWaitForUi(editor, '[role="menu"]');
  };

  const closeToolbar = (editor: Editor) =>
    TinyUiActions.clickOnToolbar(editor, '[title="Line height"]');

  const pOpenMenu = async (editor: Editor) => {
    TinyUiActions.clickOnMenu(editor, 'button:contains("Format")');
    await TinyUiActions.pWaitForUi(editor, '[role="menu"]');
    TinyUiActions.clickOnUi(editor, '[role="menu"] [title="Line height"]');
  };

  const closeMenu = (editor: Editor) =>
    TinyUiActions.clickOnMenu(editor, 'button:contains("Format")');

  const menuSelector = (mode: 'menu' | 'toolbar') => ({
    menu: '[role="menu"]~[role="menu"]', // the line-height submenu is always the *second* menu in the sink
    toolbar: '[role="menu"]' // the toolbar is always the *only* menu in the sink
  })[mode];

  const pSelectLineHeight = async (editor: Editor, mode: 'menu' | 'toolbar', lineHeight: string) => {
    await TinyUiActions.pWaitForUi(editor, menuSelector(mode));
    TinyUiActions.clickOnUi(editor, `[role="menuitemcheckbox"][title="${lineHeight}"]`);
  };

  const pAssertOptions = async (editor: Editor, mode: 'menu' | 'toolbar', ideal: string[], current: Optional<string>) => {
    const menu = await TinyUiActions.pWaitForUi(editor, menuSelector(mode));
    // ensure that there aren't two checked options
    UiFinder.notExists(menu, '[aria-checked="true"]~[aria-checked="true"]');
    // ensure that the checked option (if it exists) lines up with what we expect
    current.fold(
      () => UiFinder.notExists(menu, '[aria-checked="true"]'),
      (current) => UiFinder.exists(menu, `[aria-checked="true"][title="${current}"]`)
    );
    // ensure that the list of options is correct
    const elements = UiFinder.findAllIn(menu, '[role="menuitemcheckbox"]');
    const actual = Arr.map(elements, (element) => Attribute.get(element, 'title'));
    assert.deepEqual(actual, ideal, 'Toolbar contains the correct line heights');
  };

  context('Default settings', () => {
    const hook = TinyHooks.bddSetup<Editor>({
      ...settings,
    }, [ Theme ]);

    it('TINY-4843: Toolbar lists correct line heights', async () => {
      const editor = hook.editor();
      editor.setContent('<p style="line-height: 1.4;">Hello</p>');
      TinySelections.setCursor(editor, [ 0, 0 ], 0);
      await pOpenToolbar(editor);
      await pAssertOptions(editor, 'toolbar', [ '1', '1.1', '1.2', '1.3', '1.4', '1.5', '2' ], Optional.some('1.4'));
      closeToolbar(editor);
    });

    it('TINY-4843: Menu lists correct line heights', async () => {
      const editor = hook.editor();
      editor.setContent('<p style="line-height: 1.4;">Hello</p>');
      TinySelections.setCursor(editor, [ 0, 0 ], 0);
      await pOpenMenu(editor);
      await pAssertOptions(editor, 'menu', [ '1', '1.1', '1.2', '1.3', '1.4', '1.5', '2' ], Optional.some('1.4'));
      closeMenu(editor);
    });

    it('TINY-4843: Toolbar can alter line height', async () => {
      const editor = hook.editor();
      editor.setContent('<p>Hello</p>');
      TinySelections.setCursor(editor, [ 0, 0 ], 0);
      await pOpenToolbar(editor);
      await pSelectLineHeight(editor, 'toolbar', '1.5');
      TinyAssertions.assertContent(editor, '<p style="line-height: 1.5;">Hello</p>');
    });

    it('TINY-4843: Menu can alter line height', async () => {
      const editor = hook.editor();
      editor.setContent('<p>Hello</p>');
      TinySelections.setCursor(editor, [ 0, 0 ], 0);
      await pOpenMenu(editor);
      await pSelectLineHeight(editor, 'menu', '1.5');
      TinyAssertions.assertContent(editor, '<p style="line-height: 1.5;">Hello</p>');
    });

    it('TINY-4843: Toolbar only shows values within settings', async () => {
      const editor = hook.editor();
      editor.setContent('<p style="line-height: 30px;">Hello</p>');
      TinySelections.setCursor(editor, [ 0, 0 ], 0);
      await pOpenToolbar(editor);
      await pAssertOptions(editor, 'toolbar', [ '1', '1.1', '1.2', '1.3', '1.4', '1.5', '2' ], Optional.none());
      closeToolbar(editor);
    });

    it('TINY-4843: Menu only shows values within settings', async () => {
      const editor = hook.editor();
      editor.setContent('<p style="line-height: 30px;">Hello</p>');
      TinySelections.setCursor(editor, [ 0, 0 ], 0);
      await pOpenMenu(editor);
      await pAssertOptions(editor, 'menu', [ '1', '1.1', '1.2', '1.3', '1.4', '1.5', '2' ], Optional.none());
      closeMenu(editor);
    });

    it('TINY-4843: Toolbar updates if line height changes', async () => {
      const editor = hook.editor();
      editor.setContent('<p style="line-height: 1.4;">Hello</p>');
      TinySelections.setCursor(editor, [ 0, 0 ], 0);
      await pOpenToolbar(editor);
      await pAssertOptions(editor, 'toolbar', [ '1', '1.1', '1.2', '1.3', '1.4', '1.5', '2' ], Optional.some('1.4'));
      editor.execCommand('LineHeight', false, '1.1');
      await pAssertOptions(editor, 'toolbar', [ '1', '1.1', '1.2', '1.3', '1.4', '1.5', '2' ], Optional.some('1.1'));
      closeToolbar(editor);
    });

    it('TINY-4843: Menu updates if line height changes', async () => {
      const editor = hook.editor();
      editor.setContent('<p style="line-height: 1.4;">Hello</p>');
      TinySelections.setCursor(editor, [ 0, 0 ], 0);
      await pOpenMenu(editor);
      await pAssertOptions(editor, 'menu', [ '1', '1.1', '1.2', '1.3', '1.4', '1.5', '2' ], Optional.some('1.4'));
      editor.execCommand('LineHeight', false, '1.1');
      await pAssertOptions(editor, 'menu', [ '1', '1.1', '1.2', '1.3', '1.4', '1.5', '2' ], Optional.some('1.1'));
      closeMenu(editor);
    });
  });

  context('Float line height detection', () => {
    const hook = TinyHooks.bddSetup<Editor>({
      ...settings,
      lineheight_formats: '1 1.1 1.11 1.111'
    }, [ Theme ]);

    it('TINY-4843: Toolbar lists specified line heights', async () => {
      const editor = hook.editor();
      await pOpenToolbar(editor);
      await pAssertOptions(editor, 'toolbar', [ '1', '1.1', '1.11', '1.111' ], Optional.none());
      closeToolbar(editor);
    });

    it('TINY-4843: Menu lists specified line heights', async () => {
      const editor = hook.editor();
      await pOpenMenu(editor);
      await pAssertOptions(editor, 'menu', [ '1', '1.1', '1.11', '1.111' ], Optional.none());
      closeMenu(editor);
    });
  });

  context('', () => {
    const hook = TinyHooks.bddSetup<Editor>({
      ...settings,
      lineheight_formats: '1.000 20px 22.0px 1.5e2%'
    }, [ Theme ]);

    it('TINY-4843: Toolbar preserves original line height formats', async () => {
      const editor = hook.editor();
      await pOpenToolbar(editor);
      await pAssertOptions(editor, 'toolbar', [ '1.000', '20px', '22.0px', '1.5e2%' ], Optional.none());
      closeToolbar(editor);
    });

    it('TINY-4843: Menu preserves original line height formats', async () => {
      const editor = hook.editor();
      await pOpenMenu(editor);
      await pAssertOptions(editor, 'menu', [ '1.000', '20px', '22.0px', '1.5e2%' ], Optional.none());
      closeMenu(editor);
    });

    it('TINY-4843: Toolbar normalises line heights for comparison purposes', async () => {
      const editor = hook.editor();
      editor.setContent('<p style="line-height: 150%">Hello</p>');
      TinySelections.setCursor(editor, [ 0, 0 ], 0);
      await pOpenToolbar(editor);
      await pAssertOptions(editor, 'toolbar', [ '1.000', '20px', '22.0px', '1.5e2%' ], Optional.some('1.5e2%'));
      closeToolbar(editor);
    });

    it('TINY-4843: Menu normalises line heights for comparison purposes', async () => {
      const editor = hook.editor();
      editor.setContent('<p style="line-height: 150%">Hello</p>');
      TinySelections.setCursor(editor, [ 0, 0 ], 0);
      await pOpenMenu(editor);
      await pAssertOptions(editor, 'menu', [ '1.000', '20px', '22.0px', '1.5e2%' ], Optional.some('1.5e2%'));
      closeMenu(editor);
    });
  });
});
