import { Assertions, Chain, FocusTools, GeneralSteps, Keyboard, Keys, Log, Pipeline, UiControls, UiFinder } from '@ephox/agar';
import { UnitTest } from '@ephox/bedrock-client';
import { document } from '@ephox/dom-globals';
import { TinyApis, TinyLoader, TinyUi } from '@ephox/mcagar';
import { Body, Element, Value } from '@ephox/sugar';

import Editor from 'tinymce/core/api/Editor';
import Plugin from 'tinymce/plugins/lists/Plugin';
import Theme from 'tinymce/themes/silver/Theme';

UnitTest.asynctest('tinymce.lists.browser.ListPropertiesTest', (success, failure) => {
  Plugin();
  Theme();

  const contentMenuSelector = '.tox-tinymce-aux .tox-menu .tox-collection__item:contains("List properties...")';
  const inputSelector = 'label:contains(Start list at number) + input.tox-textfield';

  const sOpenContextMenu = (editor: Editor, tinyUi: TinyUi, target: string) => Chain.asStep(editor, [
    tinyUi.cTriggerContextMenu('trigger context menu', target, '.tox-silver-sink [role="menuitem"]'),
    Chain.wait(0)
  ]);

  const sOpenDialog = (editor: Editor, tinyUi: TinyUi, contextMenuSelector: string) => {
    const doc = Element.fromDom(document);
    return GeneralSteps.sequence([
      sOpenContextMenu(editor, tinyUi, contextMenuSelector),
      FocusTools.sTryOnSelector('Wait for the context menu to be focused', doc, contentMenuSelector),
      Keyboard.sKeydown(doc, Keys.enter(), {}),
      tinyUi.sWaitForUi('Wait for the dialog to appear', '[role=dialog]'),
    ]);
  };

  const sUpdateStart = (currentValue: string, newValue: string) => {
    const doc = Element.fromDom(document);
    return GeneralSteps.sequence([
      FocusTools.sIsOnSelector('Check focus is on the input field', doc, inputSelector),
      Chain.asStep(doc, [
        FocusTools.cGetFocused,
        Chain.op((input) => {
          Assertions.assertEq('Assert initial start value', currentValue, Value.get(input));
        }),
        UiControls.cSetValue(newValue)
      ]),
    ]);
  };

  const sOpenAndUpdateDialog = (editor: Editor, tinyUi: TinyUi, contextMenuSelector: string, currentValue: string, newValue: string) => GeneralSteps.sequence([
    sOpenDialog(editor, tinyUi, contextMenuSelector),
    sUpdateStart(currentValue, newValue),
    tinyUi.sSubmitDialog('[role=dialog]')
  ]);

  const sAssertListPropMenuNotVisible = UiFinder.sNotExists(Body.body(), contentMenuSelector);

  TinyLoader.setupLight((editor, onSuccess, onFailure) => {
    const tinyApis = TinyApis(editor);
    const tinyUi = TinyUi(editor);

    Pipeline.async({}, [
      tinyApis.sFocus(),
      Log.stepsAsStep('TINY-3915', 'List properties context menu not shown for DL', [
        tinyApis.sSetContent('<dl><dt>Item 1</dt><dt>Item 2</dt></dl>'),
        tinyApis.sSetCursor([ 0, 0, 0 ], 0),
        sOpenContextMenu(editor, tinyUi, 'dl > dt'),
        sAssertListPropMenuNotVisible
      ]),
      Log.stepsAsStep('TINY-3915', 'List properties context menu not shown for UL', [
        tinyApis.sSetContent('<ul><li>Item 1</li><li>Item 2</li></ul>'),
        tinyApis.sSetCursor([ 0, 0, 0 ], 0),
        sOpenContextMenu(editor, tinyUi, 'ul > li'),
        sAssertListPropMenuNotVisible
      ]),
      Log.stepsAsStep('TINY-3915', 'List properties context menu not shown for UL in OL', [
        tinyApis.sSetContent('<ol><li>Root Item<ul><li>Item 1</li><li>Item 2</li></ul></li></ol>'),
        tinyApis.sSetCursor([ 0, 0, 1, 0, 0 ], 0),
        sOpenContextMenu(editor, tinyUi, 'ul > li'),
        sAssertListPropMenuNotVisible
      ]),
      Log.stepsAsStep('TINY-3915', 'List properties shown for OL and can change start value', [
        tinyApis.sSetContent('<ol><li>Item 1</li><li>Item 2</li></ol>'),
        tinyApis.sSetCursor([ 0, 0, 0 ], 0),
        sOpenAndUpdateDialog(editor, tinyUi, 'ol > li', '1', '5'),
        tinyApis.sAssertContent('<ol start="5"><li>Item 1</li><li>Item 2</li></ol>'),
        sOpenAndUpdateDialog(editor, tinyUi, 'ol > li', '5', '1'),
        tinyApis.sAssertContent('<ol><li>Item 1</li><li>Item 2</li></ol>')
      ]),
      Log.stepsAsStep('TINY-3915', 'List properties shown for OL in UL and can change start value', [
        tinyApis.sSetContent('<ul><li>Root Item<ol><li>Item 1</li><li>Item 2</li></ol></li></ul>'),
        tinyApis.sSetCursor([ 0, 0, 1, 0, 0 ], 0),
        sOpenAndUpdateDialog(editor, tinyUi, 'ol > li',  '1', '5'),
        tinyApis.sAssertContent('<ul><li>Root Item<ol start="5"><li>Item 1</li><li>Item 2</li></ol></li></ul>'),
        sOpenAndUpdateDialog(editor, tinyUi, 'ol > li', '5', '1'),
        tinyApis.sAssertContent('<ul><li>Root Item<ol><li>Item 1</li><li>Item 2</li></ol></li></ul>')
      ]),
      Log.stepsAsStep('TINY-3915', 'List properties shown for nested OL and can change start value', [
        tinyApis.sSetContent('<ol><li>Root Item<ol><li>Item 1</li><li>Item 2</li></ol></li></ol>'),
        tinyApis.sSetCursor([ 0, 0, 1, 0, 0 ], 0),
        sOpenAndUpdateDialog(editor, tinyUi, 'ol ol > li', '1', '5'),
        tinyApis.sAssertContent('<ol><li>Root Item<ol start="5"><li>Item 1</li><li>Item 2</li></ol></li></ol>'),
        sOpenAndUpdateDialog(editor, tinyUi, 'ol ol > li', '5', '1'),
        tinyApis.sAssertContent('<ol><li>Root Item<ol><li>Item 1</li><li>Item 2</li></ol></li></ol>')
      ]),
      Log.stepsAsStep('TINY-3915', 'List properties command', [
        tinyApis.sSetContent('<ol><li>Root Item<ol><li>Item 1</li><li>Item 2</li></ol></li></ol>'),
        tinyApis.sSetCursor([ 0, 0, 0 ], 0),
        tinyApis.sExecCommand('mceListProps'),
        sUpdateStart('1', '10'),
        tinyUi.sSubmitDialog('[role=dialog]'),
        tinyApis.sAssertContent('<ol start="10"><li>Root Item<ol><li>Item 1</li><li>Item 2</li></ol></li></ol>')
      ])
    ], onSuccess, onFailure);
  }, {
    plugins: 'lists',
    contextmenu: 'lists bold',
    indent: false,
    theme: 'silver',
    base_url: '/project/tinymce/js/tinymce'
  }, success, failure);
});
