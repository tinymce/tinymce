import { before, describe, it } from '@ephox/bedrock-client';
import { Arr } from '@ephox/katamari';
import { McEditor } from '@ephox/wrap-mcagar';

import Editor from 'tinymce/core/api/Editor';
import { ToolbarLocation } from 'tinymce/themes/silver/api/Settings';
import Theme from 'tinymce/themes/silver/Theme';

import * as StickyUtils from '../../../module/StickyHeaderUtils';

describe('browser.tinymce.themes.silver.editor.header.StickyHeaderInitialPlacementTest ', () => {
  before(() => {
    Theme();
  });

  Arr.each([
    { location: ToolbarLocation.top, height: 2000, expectDocked: false },
    { location: ToolbarLocation.bottom, height: 500, expectDocked: false },
    { location: ToolbarLocation.bottom, height: 2000, expectDocked: true }
  ], (test) => {
    it(`Test toolbar initial placement with toolbar_location: ${test.location} and height: ${test.height}`, async () => {
      const editor = await McEditor.pFromSettings<Editor>({
        base_url: '/project/tinymce/js/tinymce',
        height: test.height,
        toolbar_location: test.location,
        toolbar_sticky: true
      });
      editor.focus();
      if (test.expectDocked) {
        const isToolbarTop = test.location === ToolbarLocation.top;
        await StickyUtils.pAssertHeaderDocked(isToolbarTop);
      }
      StickyUtils.assertEditorClasses(test.expectDocked);
      McEditor.remove(editor);
    });
  });
});
