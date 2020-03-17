import { Chain, Keyboard, Keys, Log, Mouse, Pipeline } from '@ephox/agar';
import { document } from '@ephox/dom-globals';
import { TinyApis, TinyLoader, TinyUi } from '@ephox/mcagar';
import { Element } from '@ephox/sugar';

import ImagePlugin from 'tinymce/plugins/image/Plugin';
import SilverTheme from 'tinymce/themes/silver/Theme';
import { UnitTest } from '@ephox/bedrock-client';

UnitTest.asynctest('browser.tinymce.plugins.image.ContextMenuTest', (success, failure) => {
  SilverTheme();
  ImagePlugin();

  TinyLoader.setup(function (editor, onSuccess, onFailure) {
    const tinyApis = TinyApis(editor);
    const tinyUi = TinyUi(editor);

    const rootDoc = Element.fromDom(document);

    const sOpenContextMenu = (target) => Chain.asStep(editor, [
      tinyUi.cTriggerContextMenu('trigger image context menu', target, '.tox-silver-sink [role="menuitem"]'),
      // Not sure why this is needed, but without the browser deselects the contextmenu target
      Chain.wait(0)
    ]);

    const sWaitForAndSubmitDialog = Chain.asStep(editor, [
      tinyUi.cWaitForPopup('wait for dialog', 'div[role="dialog"]'),
      Mouse.cClickOn('.tox-button:contains("Save")')
    ]);

    Pipeline.async({}, [
      tinyApis.sFocus(),
      Log.stepsAsStep('TBA', 'Opening context menus on a selected figure', [
        tinyApis.sSetRawContent('<figure class="image" contenteditable="false"><img src="image.png"><figcaption contenteditable="true">Caption</figcaption></figure><p>Second paragraph</p>'),
        tinyApis.sSetSelection([], 0, [], 1),
        sOpenContextMenu('figure.image'),
        Keyboard.sKeydown(rootDoc, Keys.enter(), {}),
        sWaitForAndSubmitDialog,
        tinyApis.sAssertSelection([], 0, [], 1)
      ]),
      Log.stepsAsStep('TBA', 'Opening context menus on an unselected figure', [
        tinyApis.sSetRawContent('<figure class="image" contenteditable="false"><img src="image.png"><figcaption contenteditable="true">Caption</figcaption></figure><p>Second paragraph</p>'),
        tinyApis.sSetSelection([ 1, 0 ], 1, [ 1, 0 ], 1),
        sOpenContextMenu('figure.image'),
        Keyboard.sKeydown(rootDoc, Keys.enter(), {}),
        sWaitForAndSubmitDialog,
        tinyApis.sAssertSelection([], 0, [], 1)
      ]),
      Log.stepsAsStep('TBA', 'Opening context menus on a selected image', [
        tinyApis.sSetRawContent('<p><img src="image.png" /></p><p>Second paragraph</p>'),
        tinyApis.sSetSelection([ 0 ], 0, [ 0 ], 1),
        sOpenContextMenu('img'),
        Keyboard.sKeydown(rootDoc, Keys.enter(), {}),
        sWaitForAndSubmitDialog,
        tinyApis.sAssertSelection([ 0 ], 0, [ 0 ], 1)
      ]),
      Log.stepsAsStep('TBA', 'Opening context menus on an unselected image', [
        tinyApis.sSetRawContent('<p><img src="image.png" /></p><p>Second paragraph</p>'),
        tinyApis.sSetSelection([ 1, 0 ], 1, [ 1, 0 ], 1),
        sOpenContextMenu('img'),
        Keyboard.sKeydown(rootDoc, Keys.enter(), {}),
        sWaitForAndSubmitDialog,
        tinyApis.sAssertSelection([ 0 ], 0, [ 0 ], 1)
      ])
    ], onSuccess, onFailure);
  }, {
    theme: 'silver',
    plugins: 'image',
    toolbar: 'image',
    indent: false,
    base_url: '/project/tinymce/js/tinymce',
    image_caption: true
  }, success, failure);
});
