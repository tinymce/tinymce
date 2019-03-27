import { UnitTest } from '@ephox/bedrock';
import Settings from 'tinymce/themes/silver/ui/menus/contextmenu/Settings';
import Editor from 'tinymce/core/api/Editor';
import { RawAssertions } from '@ephox/agar';
import EditorManager from 'tinymce/core/api/EditorManager';

UnitTest.test('Editor context menu settings test', () => {
  const userItems = Settings.getContextMenu(new Editor('id', { contextmenu: 'link image' }, EditorManager));
  RawAssertions.assertEq('Should pass user specified items though', ['link', 'image'], userItems);

  const editor = new Editor('id', { }, EditorManager);
  editor.ui.registry.addContextMenu('link', {
    update: () => []
  });
  const defaultItems = Settings.getContextMenu(editor);
  RawAssertions.assertEq('Should filter out non existing default items', ['link'], defaultItems);
});