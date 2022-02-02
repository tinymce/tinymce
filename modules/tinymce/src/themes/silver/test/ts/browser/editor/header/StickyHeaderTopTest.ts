import { describe } from '@ephox/bedrock-client';

import { ToolbarLocation, ToolbarMode } from 'tinymce/themes/silver/api/Settings';

import { testStickyHeader } from '../../../module/StickyHeaderStep';

describe('browser.tinymce.themes.silver.editor.header.StickyHeaderTopTest', () => {
  testStickyHeader(ToolbarMode.default, ToolbarLocation.top);
  testStickyHeader(ToolbarMode.floating, ToolbarLocation.top);
  testStickyHeader(ToolbarMode.sliding, ToolbarLocation.top);
});
