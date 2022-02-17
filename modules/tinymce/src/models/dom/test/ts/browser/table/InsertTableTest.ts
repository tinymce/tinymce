import { context, describe, it } from '@ephox/bedrock-client';
import { Arr } from '@ephox/katamari';
import { TinyHooks } from '@ephox/wrap-mcagar';

import Editor from 'tinymce/core/api/Editor';

import * as TableTestUtils from '../../module/table/TableTestUtils';

describe('browser.tinymce.models.dom.table.InsertTableTest', () => {
  Arr.each([
    { label: 'no colgroup', withColgroup: false },
    { label: 'colgroup', withColgroup: true },
  ], ({ label, withColgroup }) => {
    const hook = TinyHooks.bddSetup<Editor>({
      indent: false,
      valid_styles: {
        '*': 'width,height,vertical-align,text-align,float,border-color,' +
          'background-color,border,padding,border-spacing,border-collapse'
      },
      base_url: '/project/tinymce/js/tinymce',
      statusbar: false,
      table_use_colgroups: withColgroup
    }, []);

    context(label, () => {
      it('TBA: insert 2x2 table', () =>
        TableTestUtils.insertTableTest(hook.editor(), 2, 2, [
          [ 50, 50 ],
          [ 50, 50 ]
        ], withColgroup)
      );

      it('TBA: insert 1x2 table', () =>
        TableTestUtils.insertTableTest(hook.editor(), 1, 2, [
          [ 100 ],
          [ 100 ]
        ], withColgroup)
      );

      it('TBA: insert 2x1 table', () =>
        TableTestUtils.insertTableTest(hook.editor(), 2, 1, [
          [ 50, 50 ]
        ], withColgroup)
      );
    });
  });
});
