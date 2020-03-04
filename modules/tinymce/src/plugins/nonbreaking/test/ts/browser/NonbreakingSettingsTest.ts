import { Assertions } from '@ephox/agar';
import Editor from 'tinymce/core/api/Editor';
import EditorManager from 'tinymce/core/api/EditorManager';
import * as Settings from 'tinymce/plugins/nonbreaking/api/Settings';
import { UnitTest } from '@ephox/bedrock-client';

UnitTest.test('browser.tinymce.plugins.nonbreaking.SettingsTest', function () {
  Assertions.assertEq('TestCase-TBA: NonBreaking: Should be 0 as default', 0, Settings.getKeyboardSpaces(new Editor('x', {}, EditorManager)));
  Assertions.assertEq('TestCase-TBA: NonBreaking: Should return 3 if set to true', 3, Settings.getKeyboardSpaces(new Editor('x', { nonbreaking_force_tab: true }, EditorManager)));
  Assertions.assertEq('TestCase-TBA: NonBreaking: Should return 0 if set to false', 0, Settings.getKeyboardSpaces(new Editor('x', { nonbreaking_force_tab: false }, EditorManager)));
  Assertions.assertEq('TestCase-TBA: NonBreaking: Should return number if set', 4, Settings.getKeyboardSpaces(new Editor('x', { nonbreaking_force_tab: 4 }, EditorManager)));
});
