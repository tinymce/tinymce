import { FocusTools, Keyboard, Keys, Log, Pipeline, Waiter } from '@ephox/agar';
import { UnitTest } from '@ephox/bedrock-client';
import { Arr, Fun, Optional } from '@ephox/katamari';
import { TinyLoader } from '@ephox/mcagar';
import { SugarDocument, SugarElement } from '@ephox/sugar';
import Editor from 'tinymce/core/api/Editor';
import { RawEditorSettings } from 'tinymce/core/api/SettingsTypes';
import Theme from 'tinymce/themes/silver/Theme';

UnitTest.asyncTest('browser.tinymce.themes.silver.editor.AccessibleMenuHighlightTest', (success, failure) => {
  Theme();

  const settings: RawEditorSettings = {
    theme: 'silver',
    base_url: '/project/tinymce/js/tinymce',
    toolbar: 'align lineheight fontsizeselect fontselect'
  };

  TinyLoader.setup((editor: Editor, success, failure) => {
    const container = SugarElement.fromDom(editor.getContainer());
    const doc = SugarDocument.getDocument();

    const sTestToolbar = (description: string, title: string, defaultValue: Optional<string>) => {
      const defaultMessage = defaultValue.fold(Fun.constant('the first item'), Fun.identity);
      const defaultSelector = defaultValue.fold(
        () => ':nth-child(1)',
        (value) => `:contains("${ value }")`
      );

      return Log.stepsAsStep('TINY-6399', `Does the ${ description } toolbar correctly focus on ${ defaultMessage }`, [
        FocusTools.sSetFocus(`Selecting ${ description } toolbar button`, container, `button[title="${ title }"]`),
        Keyboard.sKeystroke(doc, Keys.down(), {}),
        FocusTools.sTryOnSelector(`Is ${ defaultMessage } selected`, doc, defaultSelector),
        Keyboard.sKeystroke(doc, Keys.escape(), {})
      ]);
    };

    const sTestNestedMenu = (description: string, topLevel: string, otherLevels: string[], defaultValue: Optional<string>) => {
      const defaultMessage = defaultValue.fold(Fun.constant('the first item'), Fun.identity);
      const defaultSelector = defaultValue.fold(
        () => ':nth-child(1)',
        (value) => `:contains("${ value }")`
      );

      return Log.stepsAsStep('TINY-6399', `Does the ${ description } menu correctly focus on ${ defaultMessage }`, [
        FocusTools.sSetFocus(`Selecting ${ topLevel } menu`, container, `button[role="menuitem"]:contains("${ topLevel }")`),
        Keyboard.sKeystroke(doc, Keys.down(), {}),
        ...Arr.bind(otherLevels, (level) => [
          Waiter.sTryUntil('Waiting for submenu to open',
            FocusTools.sSetFocus(`Selecting ${ level } submenu`, doc, `div[title="${ level }"]`)
          ),
          Keyboard.sKeystroke(doc, Keys.right(), {})
        ]),
        FocusTools.sTryOnSelector(`Is ${ defaultMessage } selected`, doc, defaultSelector),
        // escape out of the nested menus
        ...Arr.map(otherLevels, Fun.constant(Keyboard.sKeystroke(doc, Keys.escape(), {}))),
        Keyboard.sKeystroke(doc, Keys.escape(), {})
      ]);
    };

    Pipeline.async({}, [
      sTestToolbar('text align', 'Align', Optional.none()),
      sTestToolbar('line height', 'Line height', Optional.some('1.4')),
      sTestToolbar('font size', 'Font sizes', Optional.some('12pt')),
      sTestToolbar('font select', 'Fonts', Optional.none()),
      sTestNestedMenu('block format', 'Format', [ 'Formats', 'Blocks' ], Optional.some('Paragraph')),
      sTestNestedMenu('font size', 'Format', [ 'Font sizes' ], Optional.some('12pt'))
    ], success, failure);
  }, settings, success, failure);
});