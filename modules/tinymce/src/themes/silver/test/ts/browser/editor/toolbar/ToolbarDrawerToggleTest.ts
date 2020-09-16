import { Chain, Log, Pipeline, Step, Assertions } from '@ephox/agar';
import { UnitTest } from '@ephox/bedrock-client';
import { ApiChains, Editor as McEditor } from '@ephox/mcagar';
import Editor from 'tinymce/core/api/Editor';
import { RawEditorSettings } from 'tinymce/core/api/SettingsTypes';
import SilverTheme from 'tinymce/themes/silver/Theme';

UnitTest.asynctest('browser.tinymce.themes.silver.editor.toolbar.ToolbarDrawerToggleTest', (success, failure) => {
  SilverTheme();

  const sAssertToolbarToggleState = (editor: Editor, expected: boolean) => Step.sync(() => {
    Assertions.assertEq('Expected toolbar toggle state to be ' + expected, expected, editor.queryCommandState('ToggleToolbarDrawer'));
  });

  const sToggleToolbar = (editor: Editor) => Step.sync(() => {
    editor.execCommand('ToggleToolbarDrawer');
  });

  const cTestToggle = (label: string, settings: RawEditorSettings, shouldToggle: boolean) => Chain.label(label, Chain.fromChains([
    McEditor.cFromSettings({
      toolbar: 'undo redo | bold italic',
      menubar: false,
      statusbar: false,
      width: 200,
      ...settings,
      base_url: '/project/tinymce/js/tinymce'
    }),
    ApiChains.cFocus,
    Chain.runStepsOnValue((editor: Editor) =>
      [
        sAssertToolbarToggleState(editor, false),
        sToggleToolbar(editor),
        sAssertToolbarToggleState(editor, shouldToggle),
        sToggleToolbar(editor),
        sAssertToolbarToggleState(editor, false)
      ]
    ),
    McEditor.cRemove
  ]));

  const cTestToolbarMode = (toolbarMode: 'floating' | 'sliding' | 'scrolling' | 'wrap', shouldToggle: boolean) =>
    Log.chainsAsChain('TINY-6032', `Check toolbar toggling: ${toolbarMode}`, [
      // Test iframe
      cTestToggle(`${toolbarMode} toolbar`, { toolbar_mode: toolbarMode }, false),
      cTestToggle(`${toolbarMode} toolbar - small width`, { toolbar_mode: toolbarMode, width: 50 }, shouldToggle),
      // Test inline
      cTestToggle(`${toolbarMode} toolbar (inline)`, { toolbar_mode: toolbarMode, inline: true }, false),
      cTestToggle(`${toolbarMode} toolbar - small width (inline)`, { toolbar_mode: toolbarMode, width: 50, inline: true }, shouldToggle)
    ]);

  Pipeline.async({}, [
    Log.chainsAsStep('TINY-6032', `Using the 'ToggleToolbarDrawer' command should toggle the toolbar if applicable`, [
      cTestToolbarMode('floating', true),
      cTestToolbarMode('sliding', true),
      cTestToolbarMode('wrap', false),
      cTestToolbarMode('scrolling', false),
      cTestToggle('Multiple toolbars', { toolbar: [ 'undo redo', 'bold italic' ] }, false),
      cTestToggle('Multiple toolbars (inline)', { toolbar: [ 'undo redo', 'bold italic' ], inline: true }, false)
    ])
  ], success, failure);
});
