import { Pipeline } from '@ephox/agar';
import { UnitTest } from '@ephox/bedrock-client';

import FullscreenPlugin from 'tinymce/plugins/fullscreen/Plugin';
import { ToolbarLocation, ToolbarMode } from 'tinymce/themes/silver/api/Settings';
import Theme from 'tinymce/themes/silver/Theme';
import { sTestStickyHeader } from '../../../module/StickyHeaderStep';

UnitTest.asynctest('Editor with sticky bottom toolbar', (success, failure) => {
  Theme();
  FullscreenPlugin();

  Pipeline.async({}, [
    sTestStickyHeader(ToolbarMode.default, ToolbarLocation.bottom),
    sTestStickyHeader(ToolbarMode.floating, ToolbarLocation.bottom),
    sTestStickyHeader(ToolbarMode.sliding, ToolbarLocation.bottom)
  ], success, failure);
});
