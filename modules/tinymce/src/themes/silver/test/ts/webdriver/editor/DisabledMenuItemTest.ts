import { Mouse, RealKeys, UiFinder, Waiter } from '@ephox/agar';
import { before, describe, it } from '@ephox/bedrock-client';
import { McEditor, TinyUiActions } from '@ephox/mcagar';
import { SugarBody } from '@ephox/sugar';

import TablePlugin from 'tinymce/plugins/table/Plugin';
import Theme from 'tinymce/themes/silver/Theme';

describe('webdriver.tinymce.themes.silver.editor.menubar.DisabledMenuItemTest', () => {

  before(() => {
    Theme();
    TablePlugin();
  });

  const settings = {
    base_url: '/project/tinymce/js/tinymce',
    plugins: 'table',
    menu: {
      table: { title: 'Table', items: 'inserttable | cell row column | tableclass tablecellclass tablecellvalign tablecellborderwidth tablecellborderstyle tablecaption tablecellbackgroundcolor tablecellbordercolor | advtablesort | tableprops deletetable' }
    },
    menubar: 'table',
  };

  const pOpenTableMenu = (editor) => {
    const tableMenuItemSelector = '[role="menuitem"]:contains("Table")';
    TinyUiActions.clickOnMenu(editor, tableMenuItemSelector);
    return Waiter.pTryUntil('Wait for a specific menu to open', () => UiFinder.exists(SugarBody.body(), tableMenuItemSelector));
  };

  const assertVerticalAlignMenuIsNotOpen = () => {
    UiFinder.notExists(SugarBody.body(), '[role="menuitemcheckbox"]:contains("None")');
    UiFinder.notExists(SugarBody.body(), '[role="menuitemcheckbox"]:contains("Top")');
    UiFinder.notExists(SugarBody.body(), '[role="menuitemcheckbox"]:contains("Middle")');
    UiFinder.notExists(SugarBody.body(), '[role="menuitemcheckbox"]:contains("Bottom")');
  };

  it('TINY-7700: Disabled menu item with children should not open on mouse hover', async () => {
    const editor = await McEditor.pFromSettings(settings);
    await pOpenTableMenu(editor);
    const disabledMenuItemSelector = '[role="menuitem"]:contains("Vertical align")';
    Mouse.hoverOn(SugarBody.body(), disabledMenuItemSelector);
    assertVerticalAlignMenuIsNotOpen();
    McEditor.remove(editor);
  });

  it('TINY-7700: Disabled menu item with children should not open on keyboard arrow right', async () => {
    const editor = await McEditor.pFromSettings(settings);
    await pOpenTableMenu(editor);
    const disabledMenuItemSelector = '[title="Vertical align"]';
    await RealKeys.pSendKeysOn(disabledMenuItemSelector, [ RealKeys.combo({}, 'arrowright') ]);
    assertVerticalAlignMenuIsNotOpen();
    McEditor.remove(editor);
  });
});
