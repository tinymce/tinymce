import { describe, it } from '@ephox/bedrock-client';
import { TinyHooks } from '@ephox/wrap-mcagar';

import Editor from 'tinymce/core/api/Editor';
import Plugin from 'tinymce/plugins/table/Plugin';

import { pAssertStyleCanBeToggledOnAndOff, setEditorContentTableAndSelection } from '../../module/test/TableModifiersTestUtils';
import * as TableTestUtils from '../../module/test/TableTestUtils';

describe('browser.tinymce.plugins.table.ui.TableBorderStyleTest', () => {
  const hook = TinyHooks.bddSetupLight<Editor>({
    plugins: 'table',
    indent: false,
    toolbar: 'tableprops tablecellborderstyle',
    base_url: '/project/tinymce/js/tinymce',
    menu: {
      table: { title: 'Table', items: 'tablecellborderstyle' },
    },
    menubar: 'table',
    table_border_styles: [
      {
        title: 'Solid',
        value: 'solid'
      },
      {
        title: 'None',
        value: ''
      },
    ]
  }, [ Plugin ], true);

  it('TINY-7478: Ensure the table border style adds and removes it as expected for a single cell', async () =>
    await pAssertStyleCanBeToggledOnAndOff(hook.editor(), {
      menuTitle: 'Border style',
      subMenuTitle: 'Solid',
      subMenuRemoveTitle: 'None',
      checkMarkEntries: 2,
      rows: 1,
      columns: 1,
      customStyle: 'border-style: solid'
    })
  );

  it('TINY-7478: Ensure the table border style adds and removes it as expected for multiple cells', async () =>
    await pAssertStyleCanBeToggledOnAndOff(hook.editor(), {
      menuTitle: 'Border style',
      subMenuTitle: 'Solid',
      subMenuRemoveTitle: 'None',
      checkMarkEntries: 2,
      rows: 2,
      columns: 2,
      customStyle: 'border-style: solid'
    })
  );

  it('TINY-7853: Table properties dialog can be updated with custom border styles', async () => {
    const editor = hook.editor();
    setEditorContentTableAndSelection(editor, 2, 2);
    await TableTestUtils.pOpenTableDialog(editor);
    TableTestUtils.assertDialogValues({
      borderstyle: '',
      backgroundcolor: '',
      bordercolor: ''
    }, true, {});
    TableTestUtils.setDialogValues({
      borderstyle: 'dashed',
      bordercolor: '',
      backgroundcolor: 'red'
    }, true, {});
    await TableTestUtils.pClickDialogButton(editor, false);
  });
});
