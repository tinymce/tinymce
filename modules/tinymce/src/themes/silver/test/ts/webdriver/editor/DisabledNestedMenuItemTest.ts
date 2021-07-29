import { Keys, Mouse, RealKeys, UiFinder, Waiter } from '@ephox/agar';
import { beforeEach, describe, it } from '@ephox/bedrock-client';
import { TinyHooks, TinyUiActions } from '@ephox/mcagar';
import { SugarBody } from '@ephox/sugar';

import { Editor } from 'tinymce/core/api/PublicApi';
import TablePlugin from 'tinymce/plugins/table/Plugin';
import Theme from 'tinymce/themes/silver/Theme';

describe('webdriver.tinymce.themes.silver.editor.menubar.DisabledNestedMenuItemTest', () => {

  const verticalAlignMenuItemSelector = '[title="Vertical align"]';
  const tableMenuItemSelector = '[role="menuitem"]:contains("Table")';

  const hook = TinyHooks.bddSetupLight<Editor>({
    base_url: '/project/tinymce/js/tinymce',
    plugins: 'table',
    menu: {
      table: { title: 'Table', items: 'inserttable | cell row column | tableclass tablecellclass tablecellvalign tablecellborderwidth tablecellborderstyle tablecaption tablecellbackgroundcolor tablecellbordercolor | advtablesort | tableprops deletetable' }
    },
    menubar: 'table',
  }, [ Theme, TablePlugin ]);

  const pOpenTableMenu = () => {
    const editor = hook.editor();
    TinyUiActions.keydown(editor, Keys.escape()); // to close table menu before opening
    TinyUiActions.clickOnMenu(editor, tableMenuItemSelector);
    return Waiter.pTryUntil('Wait for table menu to open', () => UiFinder.exists(SugarBody.body(), verticalAlignMenuItemSelector));
  };

  beforeEach(async () => {
    await pOpenTableMenu();
  });

  const assertVerticalAlignMenuIsNotOpen = () => {
    UiFinder.notExists(SugarBody.body(), '[role="menuitemcheckbox"]:contains("None")');
    UiFinder.notExists(SugarBody.body(), '[role="menuitemcheckbox"]:contains("Top")');
    UiFinder.notExists(SugarBody.body(), '[role="menuitemcheckbox"]:contains("Middle")');
    UiFinder.notExists(SugarBody.body(), '[role="menuitemcheckbox"]:contains("Bottom")');
  };

  it('TINY-7700: Disabled menu item with children should not open on mouse hover', () => {
    Mouse.hoverOn(SugarBody.body(), '[role="menuitem"]:contains("Vertical align")');
    assertVerticalAlignMenuIsNotOpen();
  });

  it('TINY-7700: Disabled menu item with children should not open on keyboard arrow right', async () => {
    await RealKeys.pSendKeysOn(verticalAlignMenuItemSelector, [ RealKeys.combo({}, 'arrowright') ]);
    assertVerticalAlignMenuIsNotOpen();
  });
});
