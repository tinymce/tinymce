import { Assertions, Chain, GeneralSteps, Log, UiFinder } from '@ephox/agar';
import { UnitTest } from '@ephox/bedrock-client';
import { Arr, Optional } from '@ephox/katamari';
import { Editor as McEditor, TinyApis, TinyUi } from '@ephox/mcagar';
import { Attribute, SugarElement } from '@ephox/sugar';
import Editor from 'tinymce/core/api/Editor';
import Theme from 'tinymce/themes/silver/Theme';

const sOpenToolbar = (ui: TinyUi) => GeneralSteps.sequence([
  ui.sClickOnToolbar('Click on line-height toolbar', '[title="Line height"]'),
  ui.sWaitForUi('Open the line-height toolbar', '[role="menu"]')
]);

const sCloseToolbar = (ui: TinyUi) =>
  ui.sClickOnToolbar('Click on line-height toolbar', '[title="Line height"]');

const sOpenMenu = (ui: TinyUi) => GeneralSteps.sequence([
  ui.sClickOnMenu('Click on Format menu', 'button:contains("Format")'),
  ui.sWaitForUi('Wait for Format menu', '[role="menu"]'),
  ui.sClickOnUi('Click on line height submenu', '[role="menu"] [title="Line height"]')
]);

const sCloseMenu = (ui: TinyUi) =>
  ui.sClickOnMenu('Click on Format menu', 'button:contains("Format")');

const menuSelector = (mode: 'menu' | 'toolbar') => ({
  menu: '[role="menu"]~[role="menu"]', // the line-height submenu is always the *second* menu in the sink
  toolbar: '[role="menu"]' // the toolbar is always the *only* menu in the sink
})[mode];

const sSelectLineHeight = (ui: TinyUi, mode: 'menu' | 'toolbar', lineHeight: string) => GeneralSteps.sequence([
  ui.sWaitForUi(`Wait for the ${ mode } to open`, menuSelector(mode)),
  ui.sClickOnUi(`Select line-height of ${ lineHeight }`, `[role="menuitemcheckbox"][title="${ lineHeight }"]`)
]);

const sAssertOptions = (ui: TinyUi, mode: 'menu' | 'toolbar', ideal: string[], current: Optional<string>) => Chain.asStep({}, [
  ui.cWaitForUi(`Wait for the ${ mode } to open`, menuSelector(mode)),
  // ensure that there aren't two checked options
  UiFinder.cNotExists('[aria-checked="true"]~[aria-checked="true"]'),
  // ensure that the checked option (if it exists) lines up with what we expect
  current.fold(
    () => UiFinder.cNotExists('[aria-checked="true"]'),
    (current) => UiFinder.cExists(`[aria-checked="true"][title="${ current }"]`)
  ),
  // ensure that the list of options is correct
  UiFinder.cFindAllIn('[role="menuitemcheckbox"]'),
  Chain.op((elements: SugarElement<HTMLElement>[]) => {
    const actual = Arr.map(elements, (element) => Attribute.get(element, 'title'));
    Assertions.assertEq('Toolbar contains the correct line heights', ideal, actual);
  })
]);

UnitTest.asyncTest('browser.tinymce.themes.silver.editor.core.LineHeightTest', (success, failure) => {
  Theme();

  const settings = {
    base_url: '/project/tinymce/js/tinymce',
    toolbar: 'lineheight'
  };

  Chain.pipeline([
    McEditor.cFromSettings(settings),
    Chain.runStepsOnValue((editor: Editor) => {
      const api = TinyApis(editor);
      const ui = TinyUi(editor);

      return [
        Log.stepsAsStep('TINY-4843', 'Toolbar lists correct line heights', [
          api.sSetContent('<p style="line-height: 1.4;">Hello</p>'),
          api.sSetCursor([ 0, 0 ], 0),
          sOpenToolbar(ui),
          sAssertOptions(ui, 'toolbar', [ '1', '1.1', '1.2', '1.3', '1.4', '1.5', '2' ], Optional.some('1.4')),
          sCloseToolbar(ui)
        ]),

        Log.stepsAsStep('TINY-4843', 'Menu lists correct line heights', [
          api.sSetContent('<p style="line-height: 1.4;">Hello</p>'),
          api.sSetCursor([ 0, 0 ], 0),
          sOpenMenu(ui),
          sAssertOptions(ui, 'menu', [ '1', '1.1', '1.2', '1.3', '1.4', '1.5', '2' ], Optional.some('1.4')),
          sCloseMenu(ui)
        ]),

        Log.stepsAsStep('TINY-4843', 'Toolbar can alter line height', [
          api.sSetContent('<p>Hello</p>'),
          api.sSetCursor([ 0, 0 ], 0),
          sOpenToolbar(ui),
          sSelectLineHeight(ui, 'toolbar', '1.5'),
          api.sAssertContent('<p style="line-height: 1.5;">Hello</p>')
        ]),

        Log.stepsAsStep('TINY-4843', 'Menu can alter line height', [
          api.sSetContent('<p>Hello</p>'),
          api.sSetCursor([ 0, 0 ], 0),
          sOpenMenu(ui),
          sSelectLineHeight(ui, 'menu', '1.5'),
          api.sAssertContent('<p style="line-height: 1.5;">Hello</p>')
        ]),

        Log.stepsAsStep('TINY-4843', 'Toolbar only shows values within settings', [
          api.sSetContent('<p style="line-height: 30px;">Hello</p>'),
          api.sSetCursor([ 0, 0 ], 0),
          sOpenToolbar(ui),
          sAssertOptions(ui, 'toolbar', [ '1', '1.1', '1.2', '1.3', '1.4', '1.5', '2' ], Optional.none()),
          sCloseToolbar(ui)
        ]),

        Log.stepsAsStep('TINY-4843', 'Menu only shows values within settings', [
          api.sSetContent('<p style="line-height: 30px;">Hello</p>'),
          api.sSetCursor([ 0, 0 ], 0),
          sOpenMenu(ui),
          sAssertOptions(ui, 'menu', [ '1', '1.1', '1.2', '1.3', '1.4', '1.5', '2' ], Optional.none()),
          sCloseMenu(ui)
        ]),

        Log.stepsAsStep('TINY-4843', 'Toolbar updates if line height changes', [
          api.sSetContent('<p style="line-height: 1.4;">Hello</p>'),
          api.sSetCursor([ 0, 0 ], 0),
          sOpenToolbar(ui),
          sAssertOptions(ui, 'toolbar', [ '1', '1.1', '1.2', '1.3', '1.4', '1.5', '2' ], Optional.some('1.4')),
          api.sExecCommand('LineHeight', '1.1'),
          sAssertOptions(ui, 'toolbar', [ '1', '1.1', '1.2', '1.3', '1.4', '1.5', '2' ], Optional.some('1.1')),
          sCloseToolbar(ui)
        ]),

        Log.stepsAsStep('TINY-4843', 'Menu updates if line height changes', [
          api.sSetContent('<p style="line-height: 1.4;">Hello</p>'),
          api.sSetCursor([ 0, 0 ], 0),
          sOpenMenu(ui),
          sAssertOptions(ui, 'menu', [ '1', '1.1', '1.2', '1.3', '1.4', '1.5', '2' ], Optional.some('1.4')),
          api.sExecCommand('LineHeight', '1.1'),
          sAssertOptions(ui, 'menu', [ '1', '1.1', '1.2', '1.3', '1.4', '1.5', '2' ], Optional.some('1.1')),
          sCloseMenu(ui)
        ])
      ];
    }),
    McEditor.cRemove,

    McEditor.cFromSettings({ ...settings, lineheight_formats: '1 1.1 1.11 1.111' }),
    Chain.runStepsOnValue((editor: Editor) => {
      const ui = TinyUi(editor);

      return [
        Log.stepsAsStep('TINY-4843', 'Toolbar lists specified line heights', [
          sOpenToolbar(ui),
          sAssertOptions(ui, 'toolbar', [ '1', '1.1', '1.11', '1.111' ], Optional.none()),
          sCloseToolbar(ui)
        ]),

        Log.stepsAsStep('TINY-4843', 'Menu lists specified line heights', [
          sOpenMenu(ui),
          sAssertOptions(ui, 'menu', [ '1', '1.1', '1.11', '1.111' ], Optional.none()),
          sCloseMenu(ui)
        ])
      ];
    }),
    McEditor.cRemove,

    McEditor.cFromSettings({ ...settings, lineheight_formats: '1.000 20px 22.0px 1.5e2%' }),
    Chain.runStepsOnValue((editor: Editor) => {
      const ui = TinyUi(editor);
      const api = TinyApis(editor);

      return [
        Log.stepsAsStep('TINY-4843', 'Toolbar preserves original line height formats', [
          sOpenToolbar(ui),
          sAssertOptions(ui, 'toolbar', [ '1.000', '20px', '22.0px', '1.5e2%' ], Optional.none()),
          sCloseToolbar(ui)
        ]),

        Log.stepsAsStep('TINY-4843', 'Menu preserves original line height formats', [
          sOpenMenu(ui),
          sAssertOptions(ui, 'menu', [ '1.000', '20px', '22.0px', '1.5e2%' ], Optional.none()),
          sCloseMenu(ui)
        ]),

        Log.stepsAsStep('TINY-4843', 'Toolbar normalises line heights for comparison purposes', [
          api.sSetContent('<p style="line-height: 150%">Hello</p>'),
          api.sSetCursor([ 0, 0 ], 0),
          sOpenToolbar(ui),
          sAssertOptions(ui, 'toolbar', [ '1.000', '20px', '22.0px', '1.5e2%' ], Optional.some('1.5e2%')),
          sCloseToolbar(ui)
        ]),

        Log.stepsAsStep('TINY-4843', 'Menu normalises line heights for comparison purposes', [
          api.sSetContent('<p style="line-height: 150%">Hello</p>'),
          api.sSetCursor([ 0, 0 ], 0),
          sOpenMenu(ui),
          sAssertOptions(ui, 'menu', [ '1.000', '20px', '22.0px', '1.5e2%' ], Optional.some('1.5e2%')),
          sCloseMenu(ui)
        ])
      ];
    }),
    McEditor.cRemove
  ], success, failure);
});
