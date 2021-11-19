import { describe, it } from '@ephox/bedrock-client';
import { assert } from 'chai';

import Editor from 'tinymce/core/api/Editor';
import EditorManager from 'tinymce/core/api/EditorManager';
import { RawEditorOptions } from 'tinymce/core/api/OptionTypes';
import * as Options from 'tinymce/themes/silver/ui/menus/contextmenu/Options';

describe('browser.tinymce.themes.silver.editor.contextmenu.ContextMenuSettingsTest', () => {
  const setupEditor = (options: RawEditorOptions): Editor => {
    const editor = new Editor('id', options, EditorManager);
    Options.register(editor);
    return editor;
  };

  it('TBA: Custom context menu settings', () => {
    const userItems = Options.getContextMenu(setupEditor({ contextmenu: 'link image' }));
    assert.deepEqual(userItems, [ 'link', 'image' ], 'Should pass user specified items though');
  });

  it('TBA: Custom context menu settings with pipe separator', () => {
    const userItems = Options.getContextMenu(setupEditor({ contextmenu: 'link | image' }));
    assert.deepEqual(userItems, [ 'link', '|', 'image' ], 'Should pass user specified items though');
  });

  it('TBA: Custom context menu settings with commas', () => {
    const userItems = Options.getContextMenu(setupEditor({ contextmenu: 'link,image' }));
    assert.deepEqual(userItems, [ 'link', 'image' ], 'Should pass user specified items though');
  });

  it('TBA: Default context menu settings', () => {
    const editor = setupEditor({});
    editor.ui.registry.addContextMenu('link', {
      update: () => []
    });
    const defaultItems = Options.getContextMenu(editor);
    assert.deepEqual(defaultItems, [ 'link' ], 'Should filter out non existing default items');
  });

  it('TINY-7072: Custom context menu settings with custom context menu item', () => {
    const userItems = Options.getContextMenu(setupEditor({ contextmenu: 'link customitem' }));
    assert.deepEqual(userItems, [ 'link', 'customitem' ], 'Should pass user specified items though');
  });
});
