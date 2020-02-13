import { Chain, Log, Pipeline } from '@ephox/agar';
import { UnitTest } from '@ephox/bedrock-client';
import { Editor as McEditor, TinyApis } from '@ephox/mcagar';
import { Body } from '@ephox/sugar';
import { ToolbarLocation } from 'tinymce/themes/silver/api/Settings';
import Theme from 'tinymce/themes/silver/Theme';
import * as StickyUtils from '../../../module/StickyHeaderUtils';

UnitTest.asynctest('browser.tinymce.themes.silver.editor.header.StickyHeaderInitialPlacementTest ', (success, failure) => {
  Theme();

  const sTestStickyHeader = (toolbarLocation: ToolbarLocation, height: number, expectDocked: boolean) => {
    const isToolbarTop = toolbarLocation === ToolbarLocation.top;

    return Chain.asStep(Body.body(), [
      McEditor.cFromSettings({
        theme: 'silver',
        base_url: '/project/tinymce/js/tinymce',
        height,
        toolbar_location: toolbarLocation,
        toolbar_sticky: true
      }),
      Chain.runStepsOnValue((editor) => {
        const tinyApis = TinyApis(editor);

        return Log.steps('TINY-4644', 'Test toolbar initial placement with toolbar_location: ' + toolbarLocation + ' and height: ' + height, [
          tinyApis.sFocus(),
          ...expectDocked ? [ StickyUtils.sAssertHeaderDocked(isToolbarTop) ] : [ ],
          StickyUtils.sAssertEditorClasses(expectDocked)
        ]);
      }),
      McEditor.cRemove
    ]);
  };

  Pipeline.async({}, [
    sTestStickyHeader(ToolbarLocation.top, 2000, false),
    sTestStickyHeader(ToolbarLocation.bottom, 500, false),
    sTestStickyHeader(ToolbarLocation.bottom, 2000, true)
  ], success, failure);
});
