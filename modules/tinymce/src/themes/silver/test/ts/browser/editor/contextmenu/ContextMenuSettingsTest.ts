import { describe, it } from '@ephox/bedrock-client';
import { assert } from 'chai';

import Editor from 'tinymce/core/api/Editor';
import EditorManager from 'tinymce/core/api/EditorManager';
import * as Settings from 'tinymce/themes/silver/ui/menus/contextmenu/Settings';

describe('browser.tinymce.themes.silver.editor.contextmenu.ContextMenuSettingsTest', () => {
  it('TBA: Custom context menu settings', () => {
    const userItems = Settings.getContextMenu(new Editor('id', { contextmenu: 'link image' }, EditorManager));
    assert.deepEqual(userItems, [ 'link', 'image' ], 'Should pass user specified items though');
  });

  it('TBA: Custom context menu settings with pipe separator', () => {
    const userItems = Settings.getContextMenu(new Editor('id', { contextmenu: 'link | image' }, EditorManager));
    assert.deepEqual(userItems, [ 'link', '|', 'image' ], 'Should pass user specified items though');
  });

  it('TBA: Custom context menu settings with commas', () => {
    const userItems = Settings.getContextMenu(new Editor('id', { contextmenu: 'link,image' }, EditorManager));
    assert.deepEqual(userItems, [ 'link', 'image' ], 'Should pass user specified items though');
  });

  it('TBA: Default context menu settings', () => {
    const editor = new Editor('id', {}, EditorManager);
    editor.ui.registry.addContextMenu('link', {
      update: () => []
    });
    const defaultItems = Settings.getContextMenu(editor);
    assert.deepEqual(defaultItems, [ 'link' ], 'Should filter out non existing default items');
  });

  it('TINY-7072: Custom context menu settings with custom context menu item', () => {
    const userItems = Settings.getContextMenu(new Editor('id', { contextmenu: 'link customitem' }, EditorManager));
    assert.deepEqual(userItems, [ 'link', 'customitem' ], 'Should pass user specified items though');
  });
});
