import { Pipeline } from '@ephox/agar';
import { UnitTest } from '@ephox/bedrock-client';

import FullscreenPlugin from 'tinymce/plugins/fullscreen/Plugin';
import { ToolbarDrawer, ToolbarLocation } from 'tinymce/themes/silver/api/Settings';
import Theme from 'tinymce/themes/silver/Theme';
import { sTestStickyHeader } from '../../../module/StickyHeaderStep';

UnitTest.asynctest('Editor with sticky toolbar', (success, failure) => {
  Theme();
  FullscreenPlugin();

  Pipeline.async({}, [
    sTestStickyHeader(ToolbarDrawer.default, ToolbarLocation.top),
    sTestStickyHeader(ToolbarDrawer.floating, ToolbarLocation.top),
    sTestStickyHeader(ToolbarDrawer.sliding, ToolbarLocation.top),
  ], success, failure);
});
