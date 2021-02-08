import { describe, it } from '@ephox/bedrock-client';
import { assert } from 'chai';

import Editor from 'tinymce/core/api/Editor';
import EditorManager from 'tinymce/core/api/EditorManager';
import * as Settings from 'tinymce/themes/silver/ui/menus/contextmenu/Settings';

describe('browser.tinymce.themes.silver.editor.contextmenu.ContextMenuSettingsTest', () => {
  it('Custom context menu settings', () => {
    const userItems = Settings.getContextMenu(new Editor('id', { contextmenu: 'link image' }, EditorManager));
    assert.deepEqual(userItems, [ 'link', 'image' ], 'Should pass user specified items though');
  });

  it('Default context menu settings', () => {
    const editor = new Editor('id', {}, EditorManager);
    editor.ui.registry.addContextMenu('link', {
      update: () => []
    });
    const defaultItems = Settings.getContextMenu(editor);
    assert.deepEqual(defaultItems, [ 'link' ], 'Should filter out non existing default items');
  });
});
