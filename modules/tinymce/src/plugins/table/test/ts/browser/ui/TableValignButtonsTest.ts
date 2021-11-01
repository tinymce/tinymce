import { context, describe, it } from '@ephox/bedrock-client';
import { TinyHooks } from '@ephox/wrap-mcagar';

import Editor from 'tinymce/core/api/Editor';
import Plugin from 'tinymce/plugins/table/Plugin';

import { pAssertStyleCanBeToggledOnAndOff } from '../../module/test/TableModifiersTestUtils';

describe('browser.tinymce.plugins.table.ui.TableValignButtonsTest', () => {
  const hook = TinyHooks.bddSetupLight<Editor>({
    plugins: 'table',
    indent: false,
    toolbar: 'tablecellvalign',
    menu: {
      table: { title: 'Table', items: 'tablecellvalign' },
    },
    menubar: 'table',
    base_url: '/project/tinymce/js/tinymce',
  }, [ Plugin ], true);

  context('Test for a single cell selection', () => {
    it('TINY-7477: Check that valign works for Top value', async () =>
      await pAssertStyleCanBeToggledOnAndOff(hook.editor(), {
        menuTitle: 'Vertical align',
        subMenuTitle: 'Top',
        subMenuRemoveTitle: 'None',
        checkMarkEntries: 4,
        rows: 1,
        columns: 1,
        customStyle: 'vertical-align: top'
      })
    );

    it('TINY-7477: Check that valign works for Middle value', async () =>
      await pAssertStyleCanBeToggledOnAndOff(hook.editor(), {
        menuTitle: 'Vertical align',
        subMenuTitle: 'Middle',
        subMenuRemoveTitle: 'None',
        checkMarkEntries: 4,
        rows: 1,
        columns: 1,
        customStyle: 'vertical-align: middle'
      })
    );

    it('TINY-7477: Check that valign works for Bottom value', async () =>
      await pAssertStyleCanBeToggledOnAndOff(hook.editor(), {
        menuTitle: 'Vertical align',
        subMenuTitle: 'Bottom',
        subMenuRemoveTitle: 'None',
        checkMarkEntries: 4,
        rows: 1,
        columns: 1,
        customStyle: 'vertical-align: bottom'
      })
    );
  });

  context('Test for multiple cell selection', () => {
    it('TINY-7477: Check that valign works for Top value', async () =>
      await pAssertStyleCanBeToggledOnAndOff(hook.editor(), {
        menuTitle: 'Vertical align',
        subMenuTitle: 'Top',
        subMenuRemoveTitle: 'None',
        checkMarkEntries: 4,
        rows: 2,
        columns: 2,
        customStyle: 'vertical-align: top'
      })
    );

    it('TINY-7477: Check that valign works for Middle value', async () =>
      await pAssertStyleCanBeToggledOnAndOff(hook.editor(), {
        menuTitle: 'Vertical align',
        subMenuTitle: 'Middle',
        subMenuRemoveTitle: 'None',
        checkMarkEntries: 4,
        rows: 2,
        columns: 2,
        customStyle: 'vertical-align: middle'
      })
    );

    it('TINY-7477: Check that valign works for Bottom value', async () =>
      await pAssertStyleCanBeToggledOnAndOff(hook.editor(), {
        menuTitle: 'Vertical align',
        subMenuTitle: 'Bottom',
        subMenuRemoveTitle: 'None',
        checkMarkEntries: 4,
        rows: 2,
        columns: 2,
        customStyle: 'vertical-align: bottom'
      })
    );
  });
});
